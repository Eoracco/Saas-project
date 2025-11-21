import { getArticlesByFeedsAndDateRange } from "@/actions/rss-fetch";
import { fetchAndStoreFeed } from "@/actions/rss-fetch";
import { prisma } from "@/lib/prisma";
import type { PrepareFeedsParams } from "./types";
import { Users } from "lucide-react";
import { serverHooks } from "next/dist/server/app-render/entry-base";

// FEED REFRESH UTILITIES

// Csche window for RSS feeds(3 hours in milliseconds)

// why 3 hours ? This balances:
// -FResh content for Users
// _Reduced load on Rss feed serverHooks
// -Better performance (fewer netwrok requests )

export const CASHE_WINDOW = 3 * 60 * 60 * 1000; //hours

// Maximun number of articles to fetch for newsletter generation

// Limits the number of articles to keep AI prompts manageable

// and generation times reasonable

export const ARTICLE_LIMIT = 100;

// Determined which feeds need refreshing(older than 3 hours)

// this function uses a global cache strategy: if any user has recently

// - Reduces load on external RSS servers
// -Improves performance across the platform
// -Keeps data reasonably fresh for everyone

// @param feedIds - Array of feed Ids to check
// @returns Array of feed IDS that need refreshing

export async function getFeedsToRefresh(feedIds: string[]): Promise<string[]> {
    const now = new Date();
    const cacheThreshold = new Date(now.getTime() - CASHE_WINDOW);

    // GEt all requested feeds with thier URLs
    const feeds = await prisma.rssFeed.findMany({
        where: {
            id: { in: feedIds },
        },
        select: {
            id: true,
            url: true,
        },
    });

    // Get the most recent fetch time for each unique URL
    // This is done in a single query using qggregation
    const urlsToCheck = [...new Set(feeds.map((f) => f.url))];

    const recentFetches = await prisma.rssFeed.groupBy({
        by: ["url"],
        where: {
            url: { in: urlsToCheck },
            lastFetched: {
                gte: cacheThreshold,
            },
        },
        _max: {
            lastFetched: true,
        },
    });

    // Build a set of URLs that were recently fetched (don't need refresh)
    const recentlyFetchedUrls = new Set(  // ✅ 修复语法
        recentFetches
            .filter((fetch) => fetch._max.lastFetched !== null)
            .map((fetch) => fetch.url)
    );

    // Feeds need refresh if their URL is not in the recently fetched set
    const feedsToRefresh = feeds  // ✅ 修复拼写
        .filter((feed) => !recentlyFetchedUrls.has(feed.url))
        .map((feed) => feed.id);

    return feedsToRefresh;
}

// prepares feeds and fetched articles for newsletter generation

// This is the main function called when generating a NEWSLETTER_ORDER_BY_CREATED_DESC.it:

// 1. Checkd which feeds are stale(> 3 hours old)
// 2. Refreshed stale feeds by fetching new articles
// 3. retrieves artivles from the database for the date range

// @param params - Feed IDs and date range for the newsletter
// @returns Array of articles randy for newsletter generation
// @throws Error if no articlese found in the date range


export async function prepareFeedsAndArticles(params: PrepareFeedsParams) {
    // Check which feeds need refreshing (skis fresh feeds)
    const feedsToRefresh = await getFeedsToRefresh(params.feedIds);

    if (feedsToRefresh.length > 0) {
        console.log(
            `Refreshing ${feedsToRefresh.length} stale feeds(out of ${params.feedIds.length} total)...`
        );

        // Refresh all stale feeds in parallel for better performance
        // Using Promise.allSettled so one failure doesnt stop others
        const refreshResults = await Promise.allSettled(
            feedsToRefresh.map((feedId) => fetchAndStoreFeed(feedId))
        );

        //log result for monitoring
        const successful = refreshResults.filter(
            (r) => r.status === "fulfilled"
        ).length;
        const failed = refreshResults.filter((r) => r.status === "rejected").length;
        console.log(
            `Feed refresh complete: ${successful} successful, ${failed} failed`
        );
    } else {
        console.log(
            `All ${params.feedIds.length} feeds are fresh (< 3 hours old), skipping refresh`
        );
    }

    // FEtch articles from the database within the specified date range
    const articles = await getArticlesByFeedsAndDateRange(
        params.feedIds,
        params.startDate,
        params.endDate,
        ARTICLE_LIMIT
    );


    // Ensure we have articles to work with
    if (articles.length === 0) {
        throw new Error("No articles found for the seleted feeds and date range");
    }

    return articles;

}
