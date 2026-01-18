/**
 * Configuration utilities
 * Provides access to app configuration including API tokens
 */

import { getMapboxToken, setMapboxToken } from '../state/store'

const MAPBOX_TOKEN_KEY = 'map2places_mapbox_token'

/**
 * Get the effective Mapbox access token
 * Prioritizes: session state > localStorage > environment variable
 * @returns The Mapbox token or null if not configured
 */
export function getEffectiveMapboxToken(): string | null {
  // Check session state first (already loaded)
  const sessionToken = getMapboxToken()
  if (sessionToken) {
    return sessionToken
  }

  // Check localStorage
  const storedToken = localStorage.getItem(MAPBOX_TOKEN_KEY)
  if (storedToken) {
    // Also set in session state for faster access
    setMapboxToken(storedToken)
    return storedToken
  }

  // Fall back to environment variable
  const envToken = import.meta.env.VITE_MAPBOX_TOKEN
  if (envToken) {
    return envToken
  }

  return null
}

/**
 * Check if a Mapbox token is configured
 */
export function hasMapboxToken(): boolean {
  return getEffectiveMapboxToken() !== null
}

/**
 * Save Mapbox token to localStorage for persistence
 */
export function saveMapboxToken(token: string): void {
  localStorage.setItem(MAPBOX_TOKEN_KEY, token)
  setMapboxToken(token)
}

/**
 * Clear saved Mapbox token
 */
export function clearMapboxToken(): void {
  localStorage.removeItem(MAPBOX_TOKEN_KEY)
  setMapboxToken(null)
}
