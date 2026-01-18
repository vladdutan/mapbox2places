/**
 * Search functionality for region discovery
 * Handles user input, API calls, and UI state
 */

import type { MapboxGeocodingFeature } from '../types/api.types'
import { searchRegions } from '../api/geocoding'
import { getSearchForm, getSearchInput, setSearchLoading, showSearchError } from './layout'
import { handleError } from '../utils/error-handler'
import { ErrorCategory } from '../types/events.types'
import { setUIState } from '../state/store'

/**
 * Search event payloads
 */
export interface SearchStartedPayload {
  query: string
}

export interface SearchCompletedPayload {
  query: string
  results: MapboxGeocodingFeature[]
}

export interface SearchErrorPayload {
  query: string
  error: string
}

// Store the last search results
let lastSearchResults: MapboxGeocodingFeature[] = []

/**
 * Initialize search functionality
 * Sets up event listeners for the search form
 */
export function initializeSearch(): void {
  const form = getSearchForm()
  const input = getSearchInput()

  if (!form || !input) {
    console.error('Search form or input not found')
    return
  }

  // Handle form submission
  form.addEventListener('submit', async (e) => {
    e.preventDefault()
    const query = input.value.trim()

    if (!query) {
      showSearchError('Please enter a search term')
      return
    }

    await performSearch(query)
  })

  // Clear error when user starts typing
  input.addEventListener('input', () => {
    showSearchError(null)
  })
}

/**
 * Perform a search and dispatch appropriate events
 * @param query - The search query
 */
async function performSearch(query: string): Promise<void> {
  // Clear previous error
  showSearchError(null)

  // Dispatch search started event
  window.dispatchEvent(new CustomEvent<SearchStartedPayload>('search:started', {
    detail: { query }
  }))

  // Update UI state
  setUIState({ isSearching: true })
  setSearchLoading(true)

  try {
    const results = await searchRegions(query)
    lastSearchResults = results

    // Dispatch search completed event
    window.dispatchEvent(new CustomEvent<SearchCompletedPayload>('search:completed', {
      detail: { query, results }
    }))

    if (results.length === 0) {
      showSearchError('No regions found. Try a different search term.')
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Search failed'

    // Dispatch search error event
    window.dispatchEvent(new CustomEvent<SearchErrorPayload>('search:error', {
      detail: { query, error: errorMessage }
    }))

    // Show user-friendly error message
    if (errorMessage.includes('Rate limit')) {
      showSearchError('Too many requests. Please wait a moment and try again.')
    } else if (errorMessage.includes('token')) {
      showSearchError('Configuration error. Please check your Mapbox token.')
    } else if (errorMessage.includes('fetch') || errorMessage.includes('network')) {
      showSearchError('Network error. Please check your connection.')
      handleError(error, ErrorCategory.Network)
    } else {
      showSearchError('Search failed. Please try again.')
      handleError(error, ErrorCategory.ApiError)
    }
  } finally {
    setUIState({ isSearching: false })
    setSearchLoading(false)
  }
}

/**
 * Get the last search results
 * @returns Array of geocoding features from the last search
 */
export function getLastSearchResults(): MapboxGeocodingFeature[] {
  return lastSearchResults
}

/**
 * Clear the last search results
 */
export function clearSearchResults(): void {
  lastSearchResults = []
}
