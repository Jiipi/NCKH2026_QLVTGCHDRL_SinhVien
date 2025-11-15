/**
 * Prisma Transaction Utilities
 * Helper functions for managing Prisma transactions
 */

const { logError } = require('../logger');

/**
 * Execute operations in a Prisma transaction
 * @param {object} prisma - Prisma client instance
 * @param {Function} callback - Async function that receives tx (transaction client)
 * @returns {Promise<any>} - Transaction result
 * 
 * @example
 * const result = await executeTransaction(prisma, async (tx) => {
 *   const user = await tx.user.create({ data: {...} });
 *   const profile = await tx.profile.create({ data: { userId: user.id } });
 *   return { user, profile };
 * });
 */
async function executeTransaction(prisma, callback) {
  try {
    return await prisma.$transaction(async (tx) => {
      return await callback(tx);
    });
  } catch (error) {
    logError('Transaction failed', error);
    throw error;
  }
}

/**
 * Execute multiple operations in a transaction with retry logic
 * @param {object} prisma - Prisma client instance
 * @param {Function} callback - Async function that receives tx
 * @param {object} options - Transaction options
 * @param {number} options.maxRetries - Maximum number of retries
 * @param {number} options.timeout - Transaction timeout in ms
 * @returns {Promise<any>} - Transaction result
 */
async function executeTransactionWithRetry(
  prisma,
  callback,
  options = { maxRetries: 3, timeout: 10000 }
) {
  const { maxRetries, timeout } = options;
  let lastError;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await prisma.$transaction(
        async (tx) => {
          return await callback(tx);
        },
        {
          maxWait: timeout,
          timeout,
        }
      );
    } catch (error) {
      lastError = error;
      logError(`Transaction attempt ${attempt} failed`, error);
      
      // Don't retry on certain errors (validation, unique constraint, etc.)
      if (
        error.code === 'P2002' || // Unique constraint
        error.code === 'P2003' || // Foreign key constraint
        error.code === 'P2025' || // Record not found
        error.statusCode === 400 ||
        error.statusCode === 422
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
 * @param {Array} items - Items to process
 * @param {Function} callback - Async function to process each chunk
 * @param {number} chunkSize - Size of each chunk (default: 100)
 * @returns {Promise<Array>} - Array of results
 */
async function batchProcess(items, callback, chunkSize = 100) {
  const results = [];
  
  for (let i = 0; i < items.length; i += chunkSize) {
    const chunk = items.slice(i, i + chunkSize);
    const chunkResults = await callback(chunk, i);
    results.push(...(Array.isArray(chunkResults) ? chunkResults : [chunkResults]));
  }
  
  return results;
}

module.exports = {
  executeTransaction,
  executeTransactionWithRetry,
  batchProcess,
};




