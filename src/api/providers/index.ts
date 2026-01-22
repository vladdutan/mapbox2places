/**
 * Provider Registry
 * Central registry for all POI providers with factory methods
 */

import type { POIProvider } from './provider.interface'
import { Provider } from '../../types/provider.types'
import { mapboxProvider } from './mapbox-provider'
import { googleProvider } from './google-provider'
import { foursquareProvider } from './foursquare-provider'
import { hasMapboxToken, hasGoogleToken, hasFoursquareToken } from '../../utils/config'

/**
 * Map of all registered providers
 */
const providerRegistry: Record<Provider, POIProvider> = {
  [Provider.Mapbox]: mapboxProvider,
  [Provider.Google]: googleProvider,
  [Provider.Foursquare]: foursquareProvider
}

/**
 * Get a specific provider by ID
 */
export function getProvider(providerId: Provider): POIProvider {
  const provider = providerRegistry[providerId]
  if (!provider) {
    throw new Error(`Unknown provider: ${providerId}`)
  }
  return provider
}

/**
 * Get all registered providers
 */
export function getAllProviders(): POIProvider[] {
  return Object.values(providerRegistry)
}

/**
 * Get all available (configured) providers
 */
export function getAvailableProviders(): POIProvider[] {
  return Object.values(providerRegistry).filter(p => p.isAvailable())
}

/**
 * Get enabled providers based on user preferences
 * Falls back to all available providers if no preferences set
 */
export function getEnabledProviders(enabledProviderIds?: Provider[]): POIProvider[] {
  if (!enabledProviderIds) {
    return getAvailableProviders()
  }

  return enabledProviderIds
    .map(id => providerRegistry[id])
    .filter(p => p && p.isAvailable())
}

/**
 * Check if a specific provider is available
 */
export function isProviderAvailable(providerId: Provider): boolean {
  switch (providerId) {
    case Provider.Mapbox:
      return hasMapboxToken()
    case Provider.Google:
      return hasGoogleToken()
    case Provider.Foursquare:
      return hasFoursquareToken()
    default:
      return false
  }
}

/**
 * Get provider availability status for all providers
 */
export function getProviderStatus(): Record<Provider, boolean> {
  return {
    [Provider.Mapbox]: mapboxProvider.isAvailable(),
    [Provider.Google]: googleProvider.isAvailable(),
    [Provider.Foursquare]: foursquareProvider.isAvailable()
  }
}
