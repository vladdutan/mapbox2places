/**
 * Request queue with rate limiting for Mapbox API calls
 */

import type { QueuedRequest } from '../types/api.types'
import { ErrorCategory } from '../types/events.types'
import { handleError } from '../utils/error-handler'

const MAX_CONCURRENT_REQUESTS = 2
const MAX_RETRIES = 3
const RETRY_DELAY_BASE = 2000 // ms
const REQUEST_DELAY = 500 // ms between requests to avoid rate limiting

let activeRequests = 0
const queue: QueuedRequest<unknown>[] = []

/**
 * Add a request to the queue
 */
export function enqueue<T>(execute: () => Promise<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    const request: QueuedRequest<T> = {
      id: crypto.randomUUID(),
      execute,
      resolve: resolve as (value: unknown) => void,
      reject,
      retries: 0
    }

    queue.push(request as QueuedRequest<unknown>)
    processQueue()
  })
}

/**
 * Process queued requests respecting concurrency limit
 */
async function processQueue(): Promise<void> {
  while (queue.length > 0 && activeRequests < MAX_CONCURRENT_REQUESTS) {
    const request = queue.shift()
    if (!request) continue

    activeRequests++

    // Add delay between requests to avoid rate limiting
    await sleep(REQUEST_DELAY)

    executeRequest(request).finally(() => {
      activeRequests--
      processQueue()
    })
  }
}

/**
 * Execute a single request with retry logic
 */
async function executeRequest<T>(request: QueuedRequest<T>): Promise<void> {
  try {
    const result = await request.execute()
    request.resolve(result)
  } catch (error) {
    if (request.retries < MAX_RETRIES && shouldRetry(error)) {
      request.retries++

      // Use longer delay for rate limiting (429)
      const isRateLimited = error instanceof Error && error.message.includes('429')
      const baseDelay = isRateLimited ? 5000 : RETRY_DELAY_BASE
      const delay = baseDelay * Math.pow(2, request.retries - 1)

      await sleep(delay)
      queue.unshift(request as QueuedRequest<unknown>)
    } else {
      handleError(error, categorizeQueueError(error))
      request.reject(error instanceof Error ? error : new Error(String(error)))
    }
  }
}

/**
 * Check if request should be retried
 */
function shouldRetry(error: unknown): boolean {
  if (error instanceof Error) {
    // Retry on network errors
    if (error.message.includes('fetch') || error.name === 'TypeError') {
      return true
    }
    // Retry on rate limiting (429)
    if (error.message.includes('429')) {
      return true
    }
  }
  return false
}

/**
 * Categorize error for queue operations
 */
function categorizeQueueError(error: unknown): ErrorCategory {
  if (error instanceof Error) {
    if (error.message.includes('429')) {
      return ErrorCategory.ApiQuota
    }
    if (error.message.includes('fetch') || error.name === 'TypeError') {
      return ErrorCategory.Network
    }
  }
  return ErrorCategory.ApiError
}

/**
 * Sleep utility for delays
 */
function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

/**
 * Get current queue statistics
 */
export function getQueueStats(): { active: number; pending: number } {
  return {
    active: activeRequests,
    pending: queue.length
  }
}

/**
 * Clear all pending requests
 */
export function clearQueue(): void {
  queue.forEach(request => {
    request.reject(new Error('Queue cleared'))
  })
  queue.length = 0
}
