/**
 * Mapbox Category Search API integration
 * Used for fetching POIs by category within a geographic area
 */

import type { MapboxCategorySearchResponse, MapboxSearchFeature } from '../types/api.types'
import { enqueue } from './queue'
import { handleError } from '../utils/error-handler'
import { ErrorCategory } from '../types/events.types'
import { getEffectiveMapboxToken } from '../utils/config'
import { logDebug } from '../utils/logger'

const SEARCH_BASE_URL = 'https://api.mapbox.com/search/searchbox/v1/category'

// Maximum results per request (Mapbox limit is 25)
const MAX_RESULTS = 25

/**
 * Fetch POIs by category within a bounding box
 * @param category - The POI category to search (e.g., "grocery", "restaurant")
 * @param center - The center point [lng, lat] for proximity sorting
 * @param bbox - Bounding box [west, south, east, north] to limit results
 * @returns Array of search features (POIs)
 */
export async function fetchPlacesByCategory(
  category: string,
  center: [number, number],
  bbox: [number, number, number, number]
): Promise<MapboxSearchFeature[]> {
  const accessToken = getEffectiveMapboxToken()

  if (!accessToken) {
    throw new Error('Mapbox access token not configured. Enter your API key in settings.')
  }

  const [lng, lat] = center
  const [west, south, east, north] = bbox

  const params = new URLSearchParams({
    access_token: accessToken,
    proximity: `${lng},${lat}`,
    bbox: `${west},${south},${east},${north}`,
    limit: String(MAX_RESULTS)
  })

  const url = `${SEARCH_BASE_URL}/${encodeURIComponent(category)}?${params}`

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
      if (response.status === 404) {
        // Unknown category - return empty results
        return []
      }
      const error = new Error(`Category Search API error: ${response.status}`)
      handleError(error, ErrorCategory.ApiError)
      throw error
    }

    const data: MapboxCategorySearchResponse = await response.json()
    return data.features || []
  })
}

/**
 * Convert a Mapbox search feature to a standardized place format
 */
export function mapSearchFeatureToPlace(
  feature: MapboxSearchFeature,
  tileId: string,
  regionId: string
): {
  id: string
  tileId: string
  regionId: string
  mapboxId: string
  name: string
  category: string
  coordinates: [number, number]
  metadata: { address?: string; fullAddress?: string; placeFormatted?: string; icon?: string }
} {
  logDebug(`Place: ${feature.properties.name}`, {
    mapboxId: feature.properties.mapbox_id,
    category: feature.properties.poi_category?.[0] || feature.properties.category,
    address: feature.properties.address,
    fullAddress: feature.properties.full_address,
    placeFormatted: feature.properties.place_formatted
  })

  return {
    id: crypto.randomUUID(),
    tileId,
    regionId,
    mapboxId: feature.properties.mapbox_id,
    name: feature.properties.name_preferred || feature.properties.name,
    category: feature.properties.poi_category?.[0] || feature.properties.category || 'unknown',
    coordinates: feature.geometry.coordinates as [number, number],
    metadata: {
      address: feature.properties.address,
      fullAddress: feature.properties.full_address,
      placeFormatted: feature.properties.place_formatted,
      icon: feature.properties.maki
    }
  }
}
