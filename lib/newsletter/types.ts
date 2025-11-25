// import { NewsletterForm } from "@/components/dashboard/newsletter-form";
// import type { UserSettings } from "@prisma/client";

// // NEWSLETTER SPECIFIC TYPE DEFINITIONS

// // Article type for prompt building

// export interface ArticleForPrompt {
//     title: string;
//     feed: { title: string | null };
//     pubDate: Date;
//     summary?: string | null;
//     content?: string | null;
//     link: string;
// }

// // Parameters for building Newsletter prompt

// export interface NewsletterPromptParams {
//     startDate: Date;
//     endDate: Date;
//     articleSummaries: string;
//     articlesCount: number;
//     userInput?: string;
//     settings?: UserSettings | null;
// }



import type { UserSettings } from "@prisma/client";
import { Building } from "lucide-react";
import z from "zod";
import { TypeOf } from "zod/v3";

// NEWSLETTER SPECIFIC TYPE DEFINITIONS

// Newsletter generation result schema

// Defines the structure of AI - generated newsletters,
// The AI SDK validates resonses against this scheme,

export const NewsletterSchema = z.object({
    suggestedTitles: z.array(z.string()).length(5),
    suggestedSubjectLines: z.array(z.string()).length(5),
    body: z.string(),
    topAnnouncements: z.array(z.string()).length(5),
    additionalInfo: z.string().optional(),
});

export type GeneratedNewsletter = z.infer<typeof NewsletterSchema>

// Article type for prompt Building
export interface ArticleForPrompt {
    title: string;
    feed: { title: string | null };
    pubDate: Date;
    summary?: string | null;
    content?: string | null;
    link: string;
}

// Parameters for building Newsletter prompt

export interface NewsletterPromptParams {
    startDate: Date;
    endDate: Date;
    articleSummaries: string;
    articleCount: number;
    userInput?: string;
    settings?: UserSettings | null;
}