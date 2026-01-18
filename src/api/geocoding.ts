/**
 * Mapbox Geocoding API integration
 * Used for searching geographic regions by name
 */

import type { MapboxGeocodingResponse, MapboxGeocodingFeature } from '../types/api.types'
import { enqueue } from './queue'
import { handleError } from '../utils/error-handler'
import { ErrorCategory } from '../types/events.types'
import { getEffectiveMapboxToken } from '../utils/config'

const GEOCODING_BASE_URL = 'https://api.mapbox.com/geocoding/v5/mapbox.places'

// Region types to search for (countries, cities, districts, localities)
const REGION_TYPES = 'country,region,place,district,locality'

/**
 * Search for regions by name using Mapbox Geocoding API
 * @param query - The search query (e.g., "Berlin", "Germany", "Manhattan")
 * @returns Array of matching geocoding features
 */
export async function searchRegions(query: string): Promise<MapboxGeocodingFeature[]> {
  const accessToken = getEffectiveMapboxToken()

  if (!accessToken) {
    throw new Error('Mapbox access token not configured. Enter your API key in settings.')
  }

  const trimmedQuery = query.trim()
  if (!trimmedQuery) {
    return []
  }

  const encodedQuery = encodeURIComponent(trimmedQuery)
  const url = `${GEOCODING_BASE_URL}/${encodedQuery}.json?access_token=${accessToken}&types=${REGION_TYPES}&limit=5`

  return enqueue(async () => {
    const response = await fetch(url)

    if (!response.ok) {
      if (response.status === 429) {
        const error = new Error('Rate limit exceeded. Please try again later.')
        handleError(error, ErrorCategory.ApiQuota)
        throw error
      }
      if (response.status === 401) {
        const error = new Error('Invalid Mapbox access token')
        handleError(error, ErrorCategory.ApiError)
        throw error
      }
      const error = new Error(`Geocoding API error: ${response.status}`)
      handleError(error, ErrorCategory.ApiError)
      throw error
    }

    const data: MapboxGeocodingResponse = await response.json()
    return data.features
  })
}

/**
 * Get the display name for a geocoding feature
 * @param feature - The geocoding feature
 * @returns Human-readable display name
 */
export function getFeatureDisplayName(feature: MapboxGeocodingFeature): string {
  return feature.place_name
}

/**
 * Get the primary type for a geocoding feature
 * @param feature - The geocoding feature
 * @returns The primary place type (e.g., "country", "place", "district")
 */
export function getFeatureType(feature: MapboxGeocodingFeature): string {
  return feature.place_type[0] || 'place'
}
