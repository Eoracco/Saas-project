"use server"

import { wrapDatabaseOperation } from "@/lib/darabase/error-handler";

import { prisma } from "@/lib/prisma";

// userr Action

// Fetched a user by thier Clerk user ID
// @param clerkUserId the Clerk authentication ID
// @returns User record or null if not found

export async function getUserByClerkId(clerkUserId: string) {
    return wrapDatabaseOperation(async () => {
        return await prisma.user.findUnique({
            where: { clerkUserId },
        });
    }, "fetchi user by Clerk ID");
}

// Creates a user if they don't exist, or returns the existing user
// Updates the timestamp when user already exists(tracks last activity)

// Note: Uses findUnique when user already exists(tracks last activity)
//     (MongoDB Atlas free tier MO doesn't support transations)

//         @param clerkUserId - The Clerk authentication ID
//         @returns User record (either created or existing)

export async function upsertUserFromClerk(clerkUserId: string) {
    return wrapDatabaseOperation(async () => {
        //try to find existing user
        const existingUser = await prisma.user.findUnique({
            where: { clerkUserId },
        });

        if (existingUser) {
            //Update timestamps for existing user
            return await prisma.user.update({
                where: { clerkUserId },
                data: {
                    updatedAt: new Date(),
                },
            });
        }

        //create new user if doesn't exist 
        return await prisma.user.create({
            data: {
                clerkUserId,
            },
        });
    }, "upsert user")
}