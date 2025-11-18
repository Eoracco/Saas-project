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
        }

    })
}