import { deepseek } from "@ai-sdk/deepseek";
import { streamObject } from "ai";
import type { NextRequest } from "next/server";
import { getUserSettingsByUserId } from "@/actions/user-settings";
import { getCurrentUser } from "@/lib/auth/helpers";
import { buildArticleSummaries, buildNewsletterPrompt } from "@/lib/newsletter/prompt-builder";
import { prepareFeedsAndArticles } from "@/lib/rss/feed-refresh";
import { NewsletterSchema } from "@/lib/newsletter/types";

export const maxDuration = 300; // 5 minites for Vercel Pro

// Newsletter generation result schema

// const NewsletterSchema = z.object({
//     suggestedTitles: z.array(z.string()).length(5),
//     suggestedSubjectLines: z.array(z.string()).length(5),
//     body: z.string(),
//     topAnnouncements: z.array(z.string()).length(5),
//     additionalInfo: z.string().optional(),
// });

// POST /api/newsletter/generate-stream

// Streams newsletter generation in real0time using Vercel AI SDK.
//     The AI SDK handles all streaming complexity automatically.

// @returns AI SDK text Stream Response

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { feedIds, startDate, endDate, userInput } = body;

        // Validate required parameters

        if (!feedIds || !Array.isArray(feedIds) || feedIds.length === 0) {
            return Response.json(
                { error: "feedIds is required and must be a non-empty array" },
                { status: 400 }
            );
        }

        if (!startDate || !endDate) {
            return Response.json(
                { error: "StartDate and EndDate are required" },
                { status: 400 }
            );
        }

        // Get authenticated user and settings
        const user = await getCurrentUser();
        const settings = await getUserSettingsByUserId(user.id);


        // Fetch and prepare articles
        const articles = await prepareFeedsAndArticles({
            feedIds,
            startDate: new Date(startDate),
            endDate: new Date(endDate),
        });

        // Build the AI prompt 
        const articleSummaries = buildArticleSummaries(articles);
        const prompt = buildNewsletterPrompt({
            startDate: new Date(startDate),
            endDate: new Date(endDate),
            articleSummaries,
            articleCount: articleSummaries.length,
            userInput,
            settings,
        });

        // Stream newsletter generation with AI SDK
        const result = streamObject({
            model: deepseek("deepseek-chat"),
            schema: NewsletterSchema,
            prompt,
            onFinish: async () => {
                // Optional: Add any post - generation logic here
            },
        });

        //    Return AI SDK's native stream response 
        return result.toTextStreamResponse();
    } catch (err) {
        return Response.json(  // ✅ 添加返回语句
            {
                error: "Failed to generate newsletter",
                details: err instanceof Error ? err.message : "Unknown error"
            },
            { status: 500 }
        );
    }
}



