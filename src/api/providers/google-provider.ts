/**
 * Google Places POI Provider
 * Implements POIProvider interface for Google Places API (JS SDK New)
 */

import type { POIProvider, StandardCategory } from './provider.interface'
import { CATEGORY_MAPPINGS } from './provider.interface'
import { Provider, PROVIDER_COSTS, PROVIDER_NAMES, type ProviderPlace } from '../../types/provider.types'
import type { Bounds, Coordinates } from '../../types/exploration.types'
import { handleError } from '../../utils/error-handler'
import { ErrorCategory } from '../../types/events.types'
import { isGoogleMapsLoaded, loadGoogleMaps } from '../../utils/google-loader'

import { enqueue } from '../queue'

import { getEffectiveGoogleToken } from '../../utils/config'

/**
 * Initialize Google Maps if key is available
 */
export function initializeGoogleMaps(): void {
  const key = getEffectiveGoogleToken()
  if (key) {
    // Fire and forget - will be available when loaded
    import('../../utils/google-loader').then(({ loadGoogleMaps }) => {
      loadGoogleMaps(key).catch(err => {
        console.error('Failed to auto-init Google Maps:', err)
      })
    })
  }
}

/**
 * Google Places POI Provider implementation
 * Uses the Google Maps JavaScript API (New Places Library)
 */
export class GoogleProvider implements POIProvider {
  getProvider(): Provider {
    return Provider.Google
  }

  getName(): string {
    return PROVIDER_NAMES[Provider.Google]
  }

  isAvailable(): boolean {
    return getEffectiveGoogleToken() !== null
  }

  getCostPer1000Requests(): number {
    return PROVIDER_COSTS[Provider.Google]
  }

  mapCategory(category: StandardCategory | string): string {
    // Check if it's a standard category
    const mapping = CATEGORY_MAPPINGS[category as StandardCategory]
    if (mapping) {
      const googleCategory = mapping[Provider.Google]
      // Use the first one if array
      return Array.isArray(googleCategory) ? googleCategory[0] : googleCategory
    }
    // Return as-is if not a standard category
    return category
  }

  async fetchPlaces(
    category: string,
    center: Coordinates,
    bbox: Bounds
  ): Promise<ProviderPlace[]> {
    const key = getEffectiveGoogleToken()
    if (!key) {
      throw new Error('Google Maps API key not configured')
    }

    // Ensure script is loaded before proceeding
    if (!isGoogleMapsLoaded()) {
      try {
        await loadGoogleMaps(key)
      } catch (error) {
        throw new Error('Failed to load Google Maps script: ' + String(error))
      }
    }

    const compiledCategory = this.mapCategory(category)
    const [lng, lat] = center

    // Calculate radius
    const [west, south, east, north] = bbox
    const latDiff = Math.abs(north - south)
    const lngDiff = Math.abs(east - west)
    const radiusLat = (latDiff / 2) * 111000
    const radiusLng = (lngDiff / 2) * 111000 * Math.cos(lat * Math.PI / 180)
    const radius = Math.min(Math.max(radiusLat, radiusLng), 50000)

    // Queue request to avoid hitting rate limits too hard
    return enqueue(() => this.executeSearch(lat, lng, radius, compiledCategory))
  }

  private async executeSearch(
    lat: number,
    lng: number,
    radius: number,
    type: string
  ): Promise<ProviderPlace[]> {
    try {
      // Use importLibrary to get the Place class (New API)
      // @ts-ignore - types might not be fully up to date for 'places' library in some setups
      const { Place } = await (window as any).google.maps.importLibrary("places") as any


      // Search Nearby Request (New API)
      // Using Basic tier fields only ($17/1000 vs $40/1000)
      const request = {
        fields: [
          'id',                // Basic - unique identifier
          'displayName',       // Basic - place name
          'location',          // Basic - coordinates
          'types',             // Basic - categories
          'formattedAddress'   // Basic - address
        ],
        locationRestriction: {
          center: { lat, lng },
          radius: radius
        },
        includedTypes: [type] // New API uses includedTypes
      }

      const { places } = await Place.searchNearby(request)

      if (!places) return []
      
      return places.map(this.convertPlace)
    } catch (err: any) {
      // Check for specific Google Maps errors if needed
      const errorMessage = err instanceof Error ? err.message : String(err)
      
      // Handle quota or other specific errors
      if (errorMessage.includes('OverQueryLimit') || errorMessage.includes('quota')) {
        const error = new Error('Google Places API quota exceeded')
        handleError(error, ErrorCategory.ApiQuota)
        throw error
      }
      
      const error = new Error(`Google Places API error: ${errorMessage}`)
      handleError(error, ErrorCategory.ApiError)
      throw error
    }
  }

  private convertPlace(place: any): ProviderPlace {
    // Helper to get text from potential LocalizedString
    const getName = (nameVal: any) => {
       if (typeof nameVal === 'string') return nameVal
       return nameVal?.text || 'Unknown Place'
    }

    const name = getName(place.displayName)
    const location = place.location

    return {
      providerId: place.id,
      name: name,
      category: place.types?.[0] || 'unknown',
      coordinates: [location.lng(), location.lat()],
      address: place.formattedAddress,
      fullAddress: place.formattedAddress,
      metadata: {
        types: place.types
        // Advanced/Preferred fields removed to reduce costs
        // (rating, userRatingsTotal, priceLevel, openNow, businessStatus)
      }
    }
  }
}

// Export singleton instance
export const googleProvider = new GoogleProvider()
