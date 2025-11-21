"use server";

import { wrapDatabaseOperation } from "@/lib/darabase/error-handler";

import { FEED_ORDER_BY_CREATED_DESC, FEED_WITH_COUNT_INCLUDE } from "@/lib/darabase/prisma-helpers";
import { prisma } from "@/lib/prisma";


// RSS FEED ACTIONS

// FEtched all RSS feeds for a specific user with articles count

export async function getRssFeedsByUserId(userId: string) {
    return wrapDatabaseOperation(async () => {
        return await prisma.rssFeed.findMany({
            where: {
                userId,
            },
            include: FEED_WITH_COUNT_INCLUDE,
            orderBy: FEED_ORDER_BY_CREATED_DESC,
        });
    }, "fetch RSS feeds");
}

// Updates the lastFEtched timestamp for an RSS feed

export async function updateFeedLastFetched(feedId: string) {
    return wrapDatabaseOperation(async () => {
        return await prisma.rssFeed.update({
            where: { id: feedId },
            data: {
                lastFetched: new Date(),
            },
        });
    }, "update feed last fetched");
}

// Permanently deletes an RSS feed and cleans up articales not referenced by other feeds

export async function deleteRssFeed(feedId: string) {
    return wrapDatabaseOperation(async () => {
        // MongoDB-specific: Remove feedId from sourcefeedIds arrays
        await prisma.$runCommandRaw({
            update: "RssArticles",
            updates: [
                {
                    q: { sourceFeedIds: feedId },
                    u: { $pull: { sourceFeedIds: feedId } },
                    multi: true,
                },
            ],
        });

        // Delete articles that have no more feed references(empty sourceFeedIds)
        await prisma.rssArticle.deleteMany({
            where: {
                sourceFeedIds: {
                    isEmpty: true,
                },
            },
        });

        // finally, delete the feed itself

        await prisma.rssFeed.delete({
            where: { id: feedId }
        });

        return { success: true };

    }, "delete RSS feed");
}