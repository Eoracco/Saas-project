"use server"

import { isPrismaError, wrapDatabaseOperation } from "@/lib/darabase/error-handler";

import { ARTICLE_ORDER_BY_DATE_DESC, ARTICLE_WITH_FEED_INCLUDE } from "@/lib/darabase/prisma-helpers";
import { prisma } from "@/lib/prisma";
import type { ArticleCreateData, BulkOperationResult } from "@/lib/rss/types";

// RSS ARTICLE ACTIONS

// Creates a single RSS article with automatic deduplication using duid.
//     If article already exists, adds the current feedId to sourceFeedIDS for multi - source tracking.
//     Uses MongoDB's $addToSet to provent dullicate feedIds in the sourceFeedids array

export async function createRssArticle(data: ArticleCreateData) {
    return wrapDatabaseOperation(async () => {
        // First, Try to find existing article
        const existing = await prisma.rssArticle.findUnique({
            // date here is the intake data object
            where: { guid: data.guid },
            select: { id: true, sourceFeedIds: true },
        });

        if (existing) {
            // Article exists - only update if feedId not already in sourceFeedIds
            if (!existing.sourceFeedIds.includes(data.feedId)) {
                return await prisma.rssArticle.update({
                    where: { guid: data.guid },
                    data: {
                        sourceFeedIds: {
                            push: data.feedId,
                        },
                    },
                });
            }

            // Return existing article if feedid already present

            return await prisma.rssArticle.findUnique({
                where: { guid: data.guid }
            });
        }

        // Article doesn't exist -create new 
        return await prisma.rssArticle.create({
            data: {
                feedId: data.feedId,
                guid: data.guid,
                sourceFeedIds: [data.feedId],
                title: data.title,
                link: data.link,
                content: data.content,
                summary: data.summary,
                pubDate: data.pubDate,
                author: data.author,
                categories: data.categories || [],
                imageUrl: data.imageUrl,
            },
        });
    }, "create RSS article");
}

// Bulk creates multiple RSS articles, automatically skipping duplicates based on guid

export async function bulkCreateRssArticles(
    articles: ArticleCreateData[],
): Promise<BulkOperationResult> {
    const results: BulkOperationResult = {
        created: 0,
        skipped: 0,
        errors: 0,
    };

    for (const article of articles) {
        try {
            await createRssArticle(article);
            results.created++;
        } catch (error) {
            if (isPrismaError(error) && error.code === "P2002") {
                results.skipped++;
            } else {
                results.errors++;
                console.error(`Failed to create article ${article.guid}:`, error);
                // Log the article data that caused the error for debugging
                console.error(`Problematic article data:`, JSON.stringify(article, null, 2));
            }
        }
    }


    return results;
}

// Fetched articles by selected feeds and date ange with importance scoring
// Importance is calculated by the number of sources(sourceFeedIds length)

export async function getArticlesByFeedAndDateRange(
    feedIds: string[],
    startDate: Date,
    endDate: Date,
    limit = 100,
) {
    return wrapDatabaseOperation(async () => {
        const articles = await prisma.rssArticle.findMany({
            where: {
                OR: [
                    { feedId: { in: feedIds } },
                    {
                        sourceFeedIds: {
                            hasSome: feedIds,
                        },
                    },
                ],
                pubDate: {
                    gte: startDate,
                    lte: endDate
                },
            },
            include: ARTICLE_WITH_FEED_INCLUDE,
            orderBy: ARTICLE_ORDER_BY_DATE_DESC,
            take: limit,
        });
        return articles.map((article: (typeof articles)[number]) => ({
            ...article,
            sourceCount: article.sourceFeedIds.length,
        }));
    }, "fetch article by feeds and date range");
}