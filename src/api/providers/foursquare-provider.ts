/**
 * Foursquare POI Provider
 * Implements POIProvider interface for Foursquare Places API v3
 */

import type { POIProvider, StandardCategory } from './provider.interface'
import { CATEGORY_MAPPINGS } from './provider.interface'
import { Provider, PROVIDER_COSTS, PROVIDER_NAMES, type ProviderPlace } from '../../types/provider.types'
import type { Bounds, Coordinates } from '../../types/exploration.types'
import { enqueue } from '../queue'
import { handleError } from '../../utils/error-handler'
import { ErrorCategory } from '../../types/events.types'
import { getEffectiveFoursquareToken } from '../../utils/config'
import { logDebug } from '../../utils/logger'

const SEARCH_BASE_URL = 'https://places-api.foursquare.com/places/search'
const MAX_RESULTS = 50

/**
 * Foursquare POI Provider implementation
 */
export class FoursquareProvider implements POIProvider {
  getProvider(): Provider {
    return Provider.Foursquare
  }

  getName(): string {
    return PROVIDER_NAMES[Provider.Foursquare]
  }

  isAvailable(): boolean {
    return getEffectiveFoursquareToken() !== null
  }

  getCostPer1000Requests(): number {
    return PROVIDER_COSTS[Provider.Foursquare]
  }

  mapCategory(category: StandardCategory | string): string {
    // Check if it's a standard category
    const mapping = CATEGORY_MAPPINGS[category as StandardCategory]
    if (mapping?.foursquare) {
      return mapping.foursquare
    }
    // Return as-is if not a standard category (assume Foursquare-native ID)
    return category
  }

  async fetchPlaces(
    category: string,
    center: Coordinates,
    bbox: Bounds
  ): Promise<ProviderPlace[]> {
    const apiKey = getEffectiveFoursquareToken()

    if (!apiKey) {
      throw new Error('Foursquare API key not configured')
    }



    const mappedCategory = this.mapCategory(category)
    const [lng, lat] = center
    const [west, south, east, north] = bbox

    // Calculate radius from bbox (max 100km for Foursquare)
    const latDiff = Math.abs(north - south)
    const lngDiff = Math.abs(east - west)
    const radiusLat = (latDiff / 2) * 111000 // degrees to meters
    const radiusLng = (lngDiff / 2) * 111000 * Math.cos(lat * Math.PI / 180)
    const radius = Math.min(Math.max(radiusLat, radiusLng), 100000)

    const params = new URLSearchParams({
      ll: `${lat},${lng}`,
      radius: String(Math.round(radius)),
      fsq_category_ids: mappedCategory,
      limit: String(MAX_RESULTS)
    })

    const url = `${SEARCH_BASE_URL}?${params}`

    return enqueue(async () => {
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'X-Places-Api-Version': '2025-06-17',
          'Accept': 'application/json'
        }
      })

      if (!response.ok) {
        if (response.status === 429) {
          const error = new Error('Foursquare rate limit exceeded')
          handleError(error, ErrorCategory.ApiQuota)
          throw error
        }
        if (response.status === 401) {
          const error = new Error('Invalid Foursquare API key')
          handleError(error, ErrorCategory.ApiError)
          throw error
        }
        if (response.status === 400) {
          // Bad request - likely invalid category, return empty
          return []
        }
        const error = new Error(`Foursquare API error: ${response.status}`)
        handleError(error, ErrorCategory.ApiError)
        throw error
      }

      const data = await response.json()
      const results = data.results || []

      // Convert to ProviderPlace format
      return results.map((result: FoursquarePlace): ProviderPlace => {
        logDebug(`Foursquare Place: ${result.name}`, {
          fsqId: result.fsq_place_id,
          category: result.categories?.[0]?.name
        })

        return {
          providerId: result.fsq_place_id,
          name: result.name,
          category: result.categories?.[0]?.name || 'unknown',
          coordinates: [
            result.longitude,
            result.latitude
          ],
          address: result.location?.address,
          fullAddress: result.location?.formatted_address,
          metadata: {
            categories: result.categories,
            chain: result.chains?.[0]?.name
          }
        }
      })
    })
  }
}

/**
 * Foursquare API response types (internal)
 */
interface FoursquarePlace {
  fsq_place_id: string
  name: string
  latitude: number
  longitude: number
  categories?: Array<{
    fsq_category_id: string
    name: string
    short_name?: string
    plural_name?: string
    icon?: { prefix: string; suffix: string }
  }>
  chains?: Array<{ fsq_chain_id: string; name: string }>
  location?: {
    address?: string
    formatted_address?: string
    locality?: string
    region?: string
    country?: string
    postcode?: string
  }
}

// Export singleton instance
export const foursquareProvider = new FoursquareProvider()
