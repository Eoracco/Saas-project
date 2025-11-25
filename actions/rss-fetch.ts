"use server";

import { wrapDatabaseOperation } from "@/lib/darabase/error-handler";
import { prisma } from "@/lib/prisma";
import { type ArticleData, fetchAndParseFeed, validateFeedUrl } from "@/lib/rss/parser";
import { bulkCreateRssArticles } from "./rss-article";
import { updateFeedLastFetched } from "./rss-feed";



// Validates and Rss url and created a new feed with initial artical fetch


export async function validateAndAddFeed(userId: string, url: string) {
    return wrapDatabaseOperation(async () => {
        const isValid = await validateFeedUrl(url);
        if (!isValid) {
            throw new Error("Invalid RSS feed URL or unable to fetch fedd");
        }

        // create the Feed in database
        const feed = await prisma.rssFeed.create({
            data: {
                userId,
                url,
            },
        });

        // Fetch and store initial articles

        try {
            const result = await fetchAndStoreFeed(feed.id);

            // Update feed with metedata from Rss
            await prisma.rssFeed.update({
                where: { id: feed.id },
                data: {
                    title: result.metadata.title,
                    description: result.metadata.description,
                    link: result.metadata.link,
                    imageUrl: result.metadata.imageUrl,
                    language: result.metadata.language,
                },
            });

            return {
                feed,
                articlesCreated: result.created,
                articlesSkipped: result.skipped,
            };
        } catch (fetchError) {
            //    if initial fetch fails, still return the feed
            console.error("Failed to fetch initial articles:", fetchError);
            return {
                feed,
                articlesCreated: 0,
                articlesSkipped: 0,
                error: "Feed created but initial fetch failed"
            };
        }

    }, "add RSS feed");
}


// Fetched an RSS feed and stored new srticles

export async function fetchAndStoreFeed(feedId: string) {
    return wrapDatabaseOperation(async () => {
        // Get the deed details
        const feed = await prisma.rssFeed.findUnique({
            where: { id: feedId },
        });

        if (!feed) {
            throw new Error(`Feed with ID ${feedId} not found`);
        }


        // Fetch and parse the rss feed
        const { metadata, articles } = await fetchAndParseFeed(feed.url, feedId);

        // Convert ArticleData to format expected by bulkCreateRssArticles
        const articlesToCreate = articles.map((article: ArticleData) => ({
            feedId: feed.id,
            guid: article.guid,
            title: article.title,
            link: article.link,
            content: article.content,
            summary: article.summary,
            pubDate: article.pubDate,
            author: article.author,
            categories: article.categories,
            imageUrl: article.imageUrl,
        }));

        // Store article with automatic ded
        const result = await bulkCreateRssArticles(articlesToCreate);

        // Update the feed's lastFetched timestamp
        await updateFeedLastFetched(feedId);

        return {
            metadata,
            created: result.created,
            skipped: result.skipped,
            errors: result.errors
        };
    }, "fetch feed")
}

// // FEtched articles by selected feeds and date range with importance scoring
// // Importance is calculated by the number of sources (sourcefeedIds length)

// export async function getArticlesByFeedsAndDateRange(
//     feedIds: string[],
//     startDate: Date,
//     endDate: Date,
//     limit = 100,
// ) {
//     return wrapDatabaseOperation(async () => {
//         const articles = await prisma.rssArticle.findMany({
//             where: {
//                 OR: [
//                     { feedId: { in: feedIds } },
//                     {
//                         sourceFeedIds: {
//                             hasSome: feedIds,
//                         },
//                     },
//                 ],
//                 pubDate: {
//                     gte: startDate,
//                     lte: endDate,
//                 },
//             },
//             include: ARTICLE_WITH_FEED_INCLUDE,
//             orderBy: ARTICLE_ORDER_BY_DATE_DESC,
//             take: limit,
//         });

//         // Add sourceCount for referance
//         return articles.map((article: (typeof articles)[number]) => ({
//             ...article,
//             sourceCount: article.sourceFeedIds.length,
//         }));
//     }, "fetch articals by feeds and date range");
// }

