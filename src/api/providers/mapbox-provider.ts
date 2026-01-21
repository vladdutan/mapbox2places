/**
 * Mapbox POI Provider
 * Implements POIProvider interface for Mapbox Category Search API
 */

import type { POIProvider, StandardCategory } from './provider.interface'
import { CATEGORY_MAPPINGS } from './provider.interface'
import { Provider, PROVIDER_COSTS, PROVIDER_NAMES, type ProviderPlace } from '../../types/provider.types'
import type { Bounds, Coordinates } from '../../types/exploration.types'
import { enqueue } from '../queue'
import { handleError } from '../../utils/error-handler'
import { ErrorCategory } from '../../types/events.types'
import { getEffectiveMapboxToken } from '../../utils/config'
import { logDebug } from '../../utils/logger'

const SEARCH_BASE_URL = 'https://api.mapbox.com/search/searchbox/v1/category'
const MAX_RESULTS = 25

/**
 * Mapbox POI Provider implementation
 */
export class MapboxProvider implements POIProvider {
  getProvider(): Provider {
    return Provider.Mapbox
  }

  getName(): string {
    return PROVIDER_NAMES[Provider.Mapbox]
  }

  isAvailable(): boolean {
    return getEffectiveMapboxToken() !== null
  }

  getCostPer1000Requests(): number {
    return PROVIDER_COSTS[Provider.Mapbox]
  }

  mapCategory(category: StandardCategory | string): string {
    // Check if it's a standard category
    const mapping = CATEGORY_MAPPINGS[category as StandardCategory]
    if (mapping) {
      const mapboxCategory = mapping[Provider.Mapbox]
      return Array.isArray(mapboxCategory) ? mapboxCategory[0] : mapboxCategory
    }
    // Return as-is if not a standard category (assume Mapbox-native)
    return category
  }

  async fetchPlaces(
    category: string,
    center: Coordinates,
    bbox: Bounds
  ): Promise<ProviderPlace[]> {
    const accessToken = getEffectiveMapboxToken()

    if (!accessToken) {
      throw new Error('Mapbox access token not configured')
    }

    const mappedCategory = this.mapCategory(category)
    const [lng, lat] = center
    const [west, south, east, north] = bbox

    const params = new URLSearchParams({
      access_token: accessToken,
      proximity: `${lng},${lat}`,
      bbox: `${west},${south},${east},${north}`,
      limit: String(MAX_RESULTS)
    })

    const url = `${SEARCH_BASE_URL}/${encodeURIComponent(mappedCategory)}?${params}`

    return enqueue(async () => {
      const response = await fetch(url)

      if (!response.ok) {
        if (response.status === 429) {
          const error = new Error('Mapbox rate limit exceeded')
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
        const error = new Error(`Mapbox API error: ${response.status}`)
        handleError(error, ErrorCategory.ApiError)
        throw error
      }

      const data = await response.json()
      const features = data.features || []

      // Convert to ProviderPlace format
      return features.map((feature: MapboxSearchFeature): ProviderPlace => {
        logDebug(`Mapbox Place: ${feature.properties.name}`, {
          mapboxId: feature.properties.mapbox_id,
          category: feature.properties.poi_category?.[0] || feature.properties.category
        })

        return {
          providerId: feature.properties.mapbox_id,
          name: feature.properties.name_preferred || feature.properties.name,
          category: feature.properties.poi_category?.[0] || feature.properties.category || 'unknown',
          coordinates: feature.geometry.coordinates as [number, number],
          address: feature.properties.address,
          fullAddress: feature.properties.full_address,
          metadata: {
            placeFormatted: feature.properties.place_formatted,
            icon: feature.properties.maki
          }
        }
      })
    })
  }
}

/**
 * Mapbox API response types (internal)
 */
interface MapboxSearchFeature {
  type: 'Feature'
  id: string
  geometry: {
    type: 'Point'
    coordinates: [number, number]
  }
  properties: {
    mapbox_id: string
    name: string
    name_preferred?: string
    address?: string
    full_address?: string
    place_formatted?: string
    category?: string
    maki?: string
    poi_category?: string[]
    poi_category_ids?: string[]
    [key: string]: unknown
  }
}

// Export singleton instance
export const mapboxProvider = new MapboxProvider()
