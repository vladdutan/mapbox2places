/**
 * Centralized error handling with categorization
 */

import { ErrorCategory, type ErrorPayload } from '../types/events.types'

/**
 * Categorize and handle errors consistently
 */
export function handleError(error: unknown, category: ErrorCategory = ErrorCategory.Unknown): void {
  const message = getErrorMessage(error)

  console.error(`[${category}]`, error)

  window.dispatchEvent(new CustomEvent<ErrorPayload>('error:occurred', {
    detail: {
      category,
      message,
      context: error instanceof Error ? { stack: error.stack } : undefined
    }
  }))
}

/**
 * Extract error message from unknown error type
 */
export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message
  }
  if (typeof error === 'string') {
    return error
  }
  return 'An unknown error occurred'
}

/**
 * Categorize Mapbox API errors
 */
export function categorizeApiError(status: number): ErrorCategory {
  if (status === 429) {
    return ErrorCategory.ApiQuota
  }
  if (status >= 400 && status < 500) {
    return ErrorCategory.ApiError
  }
  if (status >= 500) {
    return ErrorCategory.Network
  }
  return ErrorCategory.Unknown
}

/**
 * Check if error is a network error
 */
export function isNetworkError(error: unknown): boolean {
  if (error instanceof TypeError && error.message.includes('fetch')) {
    return true
  }
  if (error instanceof Error && error.name === 'AbortError') {
    return true
  }
  return false
}
