/**
 * Prisma Transaction Utilities
 * Helper functions for managing Prisma transactions
 * @module core/utils/prismaTx
 */

import { PrismaClient, Prisma } from '@prisma/client';
import { logError } from '../logger';

/**
 * Type for Prisma transaction client
 */
type TransactionClient = Omit<
  PrismaClient,
  '$connect' | '$disconnect' | '$on' | '$transaction' | '$use' | '$extends'
>;

/**
 * Callback function for transaction
 */
type TransactionCallback<T> = (tx: TransactionClient) => Promise<T>;

/**
 * Transaction options
 */
interface TransactionOptions {
  maxRetries?: number;
  timeout?: number;
}

/**
 * Execute operations in a Prisma transaction
 * @param prisma - Prisma client instance
 * @param callback - Async function that receives tx (transaction client)
 * @returns Transaction result
 *
 * @example
 * const result = await executeTransaction(prisma, async (tx) => {
 *   const user = await tx.user.create({ data: {...} });
 *   const profile = await tx.profile.create({ data: { userId: user.id } });
 *   return { user, profile };
 * });
 */
export async function executeTransaction<T>(
  prisma: PrismaClient,
  callback: TransactionCallback<T>
): Promise<T> {
  try {
    return await prisma.$transaction(async (tx) => {
      return await callback(tx as TransactionClient);
    });
  } catch (error) {
    logError('Transaction failed', error as Error);
    throw error;
  }
}

/**
 * Execute multiple operations in a transaction with retry logic
 * @param prisma - Prisma client instance
 * @param callback - Async function that receives tx
 * @param options - Transaction options
 * @returns Transaction result
 */
export async function executeTransactionWithRetry<T>(
  prisma: PrismaClient,
  callback: TransactionCallback<T>,
  options: TransactionOptions = { maxRetries: 3, timeout: 10000 }
): Promise<T> {
  const { maxRetries = 3, timeout = 10000 } = options;
  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await prisma.$transaction(
        async (tx) => {
          return await callback(tx as TransactionClient);
        },
        {
          maxWait: timeout,
          timeout,
        }
      );
    } catch (error) {
      lastError = error as Error;
      logError(`Transaction attempt ${attempt} failed`, error as Error);

      // Don't retry on certain errors (validation, unique constraint, etc.)
      const prismaError = error as { code?: string; statusCode?: number };
      if (
        prismaError.code === 'P2002' || // Unique constraint
        prismaError.code === 'P2003' || // Foreign key constraint
        prismaError.code === 'P2025' || // Record not found
        prismaError.statusCode === 400 ||
        prismaError.statusCode === 422
      ) {
        throw error;
      }

      // Wait before retry (exponential backoff)
      if (attempt < maxRetries) {
        const delay = Math.min(1000 * Math.pow(2, attempt - 1), 5000);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }

  // All retries failed
  throw lastError;
}

/**
 * Batch operations helper
 * Splits large batch operations into smaller chunks to avoid transaction timeouts
 * @param items - Items to process
 * @param callback - Async function to process each chunk
 * @param chunkSize - Size of each chunk (default: 100)
 * @returns Array of results
 */
export async function batchProcess<T, R>(
  items: T[],
  callback: (chunk: T[], startIndex: number) => Promise<R | R[]>,
  chunkSize: number = 100
): Promise<R[]> {
  const results: R[] = [];

  for (let i = 0; i < items.length; i += chunkSize) {
    const chunk = items.slice(i, i + chunkSize);
    const chunkResults = await callback(chunk, i);
    results.push(...(Array.isArray(chunkResults) ? chunkResults : [chunkResults]));
  }

  return results;
}

// CommonJS compatibility
module.exports = {
  executeTransaction,
  executeTransactionWithRetry,
  batchProcess
};
