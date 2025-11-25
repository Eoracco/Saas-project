"use server"

import { deepseek } from "@ai-sdk/deepseek";
import { streamObject } from "ai";
import { z } from "zod";;
import { getCurrentUser, checkIsProUser } from "@/lib/auth/helpers";
import { buildArticleSummaries, buildNewsletterPrompt } from "@/lib/newsletter/prompt-builder";

import { prepareFeedsAndArticles } from "@/lib/rss/feed-refresh";
import { createNewsletter } from "./newsletter";
import { getUserSettingsByUserId } from "./user-settings";
import { NewsletterSchema, type GeneratedNewsletter } from "@/lib/newsletter/types";


// NEWSLETTER GENERATION ACTIONS

// Newsletter generation result scheme

// Defines the structure of AI_generated NEWSLETTER_WITH_USER_INCLUDE.
// The AI SDK Validates responses against this scheme.

// export const NewsletterSchema = z.object({
//     suggestedTitles: z.array(z.string()).length(5),
//     suggestedSubjectLines: z.array(z.string()).length(5),
//     body: z.string(),
//     topAnnouncements: z.array(z.string()).length(5),
//     additionalInfo: z.string().optional(),
// })

// export type GeneratedNewsletter = z.infer<typeof NewsletterSchema>;


// Generates a newsletter with AI streaming

// this is the main function for newsletter GenerationPage().it:
//     1. Authenticated the user
// 2. fetched user settings for customization
// 3.Prepares feed sand retrieves artivles
// 4.Builds an AI prompt with all context
// 5. Streams the AI-generated newsletter in real-time

// @param params - Feed isDataUIPart, date range, and optional user instructions
// @returns Object with the stream and articles count


export async function GeneratedNewsletterStream(params: {
    feedIds: string[];
    startDate: Date;
    endDate: Date;
    usertInput?: string;
}) {
    // Get authenticated user from database
    const user = await getCurrentUser();

    // Get user's newsletter settings(tone, branding, etc.)
    const settings = await getUserSettingsByUserId(user.id);

    // Fetch and refresh articles from RSS feeds
    const articles = await prepareFeedsAndArticles(params);


    // Build the AI prompt with articles and settings
    const articleSummaries = buildArticleSummaries(articles);
    const prompt = buildNewsletterPrompt({
        startDate: params.startDate,
        endDate: params.endDate,
        articleSummaries,
        articleCount: articles.length,
        userInput: params.usertInput,
        settings,
    });


    // Generate newsletter using Ai with streaming for real-time updates
    const { partialObjectStream } = await streamObject({
        model: deepseek('deepseek-chat'),
        schema: NewsletterSchema,
        prompt,
    });

    return {
        stream: partialObjectStream,
        articlesAnalyzed: articles.length
    };
}

// Saves a generated newsletter to the database

// Only pro users can save newsletters to their history.
// This allows them to reference past newsletters and track thier content.

// @param params - Newsletter data and generation parameters
// @returns Saved newsletter record
// @throws Error if user is not Pro or not authenticated

export async function saveGeneratedNewsletter(params: {
    newsletter: GeneratedNewsletter;
    feedIds: string[];
    startDate: Date;
    endDate: Date;
    userInput?: string;
}) {
    // Check if user has Pro plan(required for saving)
    const isPro = await checkIsProUser();
    if (!isPro) {
        throw new Error("Pro plan required to save newsletters");
    }

    // Get authenticated user
    const user = await getCurrentUser();

    // Save newsletter to database
    const savedNewsletter = await createNewsletter({
        userId: user.id,
        suggestedTitles: params.newsletter.suggestedTitles,
        suggestedSubjectLines: params.newsletter.suggestedSubjectLines,
        body: params.newsletter.body,
        topAnnouncements: params.newsletter.topAnnouncements,
        additionalInfo: params.newsletter.additionalInfo,
        startDate: params.startDate,
        endDate: params.endDate,
        userInput: params.userInput,
        feedsUsed: params.feedIds,
    });

    return savedNewsletter;
}