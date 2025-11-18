import { Prisma } from "@prisma/client";


export function isPrismaError(
    error: unknown,

): error is Prisma.PrismaClientKnownRequestError {
    return error instanceof Prisma.PrismaClientKnownRequestError;
}

export function handlePrismaError(
    error: Prisma.PrismaClientKnownRequestError,
    context: string,
): Error {
    switch (error.code) {
        case "P2002":
            return new Error(`${context}: Duplicate entry found`);
        case "P2025":
            return new Error(`${context}: Record not dound`);
        case "P2003":
            return new Error(`${context}: Foreign key constraint failed`);
        default:
            return new Error(`${context}:Database error (${error.code})`);
    }
}

export function handleDatabaseError(error: unknown, operation: string): never {
    console.error(`Failed to ${operation}:`, error)

    if (isPrismaError(error)) {
        throw handlePrismaError(error, `Failed to ${operation}`);
    }

    const message =
        error instanceof Error ? error.message : "unknown database error";
    throw new Error(`Failed to ${operation}: ${message}`);
}

export async function wrapDatabaseOperation<T>(
    operation: () => Promise<T>,
    operationName: string,
): Promise<T> {
    try {
        return await operation();
    } catch (error) {
        handleDatabaseError(error, operationName);
    }
}