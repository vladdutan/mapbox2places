/**
 * Provider interface
 * Common contract that all POI data providers must implement
 */

import type { Provider, ProviderPlace } from '../../types/provider.types'
import type { Bounds, Coordinates } from '../../types/exploration.types'

/**
 * Standard POI categories used across all providers
 * Each provider maps these to their specific category names/tags
 */
export const StandardCategory = {
  Grocery: 'grocery',
  Restaurant: 'restaurant',
  Cafe: 'cafe',
  Bank: 'bank',
  Pharmacy: 'pharmacy',
  GasStation: 'gas_station',
  Hotel: 'hotel',
  Hospital: 'hospital',
  Parking: 'parking',
  ATM: 'atm'
} as const

export type StandardCategory = typeof StandardCategory[keyof typeof StandardCategory]

/**
 * Interface that all POI providers must implement
 */
export interface POIProvider {
  /**
   * Get the provider identifier
   */
  getProvider(): Provider

  /**
   * Get human-readable provider name
   */
  getName(): string

  /**
   * Check if the provider is available (has valid API key, etc.)
   */
  isAvailable(): boolean

  /**
   * Get the estimated cost per 1000 requests
   */
  getCostPer1000Requests(): number

  /**
   * Map a standard category to the provider's specific category/tag
   */
  mapCategory(category: StandardCategory | string): string

  /**
   * Fetch POIs by category within a bounding box
   * @param category - Standard category or provider-specific category
   * @param center - Center point for proximity sorting [lng, lat]
   * @param bbox - Bounding box [west, south, east, north]
   * @returns Array of places from this provider
   */
  fetchPlaces(
    category: string,
    center: Coordinates,
    bbox: Bounds
  ): Promise<ProviderPlace[]>
}

/**
 * Category mappings for each provider
 * Uses string keys matching Provider values
 */
export interface CategoryMapping {
  mapbox: string | string[]
  google: string | string[]
  osm: string // Overpass query format: "key=value"
}

/**
 * Standard category to provider-specific mapping table
 */
export const CATEGORY_MAPPINGS: Record<StandardCategory, CategoryMapping> = {
  [StandardCategory.Grocery]: {
    mapbox: 'grocery',
    google: 'supermarket',
    osm: 'shop=supermarket|shop=convenience'
  },
  [StandardCategory.Restaurant]: {
    mapbox: 'restaurant',
    google: 'restaurant',
    osm: 'amenity=restaurant'
  },
  [StandardCategory.Cafe]: {
    mapbox: 'cafe',
    google: 'cafe',
    osm: 'amenity=cafe'
  },
  [StandardCategory.Bank]: {
    mapbox: 'bank',
    google: 'bank',
    osm: 'amenity=bank'
  },
  [StandardCategory.Pharmacy]: {
    mapbox: 'pharmacy',
    google: 'pharmacy',
    osm: 'amenity=pharmacy'
  },
  [StandardCategory.GasStation]: {
    mapbox: 'gas_station',
    google: 'gas_station',
    osm: 'amenity=fuel'
  },
  [StandardCategory.Hotel]: {
    mapbox: 'hotel',
    google: 'hotel',
    osm: 'tourism=hotel'
  },
  [StandardCategory.Hospital]: {
    mapbox: 'hospital',
    google: 'hospital',
    osm: 'amenity=hospital'
  },
  [StandardCategory.Parking]: {
    mapbox: 'parking',
    google: 'parking',
    osm: 'amenity=parking'
  },
  [StandardCategory.ATM]: {
    mapbox: 'atm',
    google: 'atm',
    osm: 'amenity=atm'
  }
}

