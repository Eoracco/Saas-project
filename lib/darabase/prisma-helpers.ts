import type { Prisma } from "@prisma/client";

export const FEED_WITH_COUNT_INCLUDE = {
    _count: {
        select: {
            articles: true,
        },
    },
} as const satisfies Prisma.RssFeedInclude;


export const ARTICLE_WITH_FEED_INCLUDE = {
    feed: {
        select: {
            id: true,
            title: true,
            url: true,
        },
    },
} as const satisfies Prisma.RssArticleInclude;


export const NEWSLETTER_WITH_USER_INCLUDE = {
    user: {
        select: {
            id: true,
            clerkUserId: true,
        },
    },
} as const satisfies Prisma.NewsletterInclude;


export const ARTICLE_ORDER_BY_DATE_DESC = {
    pubDate: "desc",

} as const satisfies Prisma.RssArticleOrderByWithRelationInput;


export const FEED_ORDER_BY_CREATED_DESC = {
    createdAt: "desc",
} as const satisfies Prisma.RssFeedOrderByWithRelationInput;


export const NEWSLETTER_ORDER_BY_CREATED_DESC = {
    createdAt: "desc",
} as const satisfies Prisma.NewsletterOrderByWithRelationInput;