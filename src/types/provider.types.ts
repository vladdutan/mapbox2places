/**
 * Provider abstraction types
 * Defines common interface for POI data providers (Mapbox, Google, Foursquare)
 */

/**
 * Available POI data providers
 */
export const Provider = {
  Mapbox: 'mapbox',
  Google: 'google',
  Foursquare: 'foursquare'
} as const

export type Provider = typeof Provider[keyof typeof Provider]

/**
 * Raw place data returned by a provider before normalization
 */
export interface ProviderPlace {
  providerId: string
  name: string
  category: string
  coordinates: [number, number] // [lng, lat]
  address?: string
  fullAddress?: string
  metadata?: Record<string, unknown>
}

/**
 * Provider-specific statistics
 */
export interface ProviderStats {
  placesFound: number
  requestsMade: number
  estimatedCost: number
  errors: number
}

/**
 * Map of provider to their stats
 */
export type ProviderStatsMap = {
  [K in Provider]?: ProviderStats
}

/**
 * Result from a provider fetch operation
 */
export interface ProviderFetchResult {
  provider: Provider
  places: ProviderPlace[]
  requestCount: number
  error?: string
}

/**
 * Provider configuration
 */
export interface ProviderConfig {
  enabled: boolean
  apiKey?: string
}

/**
 * All provider configurations
 */
export type ProviderConfigs = {
  [K in Provider]: ProviderConfig
}

/**
 * Cost per 1000 requests for each provider
 */
export const PROVIDER_COSTS: Record<Provider, number> = {
  [Provider.Mapbox]: 1.70,    // $1.70 per 1000 requests
  [Provider.Google]: 32.00,   // $32.00 per 1000 requests (Nearby Search Pro - first 5K/month free)
  [Provider.Foursquare]: 15.00 // $15.00 per 1000 requests (Pro endpoints - first 10K/month free)
}

/**
 * Provider display names
 */
export const PROVIDER_NAMES: Record<Provider, string> = {
  [Provider.Mapbox]: 'Mapbox',
  [Provider.Google]: 'Google Maps',
  [Provider.Foursquare]: 'Foursquare'
}

/**
 * Provider marker colors for map visualization
 */
export const PROVIDER_COLORS: Record<Provider, string> = {
  [Provider.Mapbox]: '#3b82f6',     // Blue
  [Provider.Google]: '#ef4444',     // Red
  [Provider.Foursquare]: '#22c55e'  // Green
}
