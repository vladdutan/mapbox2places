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

// ============================================================================
// Google Token Management
// ============================================================================

const GOOGLE_TOKEN_KEY = 'map2places_google_token'

/**
 * Get the effective Google API token
 * Prioritizes: localStorage > environment variable
 * @returns The Google token or null if not configured
 */
export function getEffectiveGoogleToken(): string | null {
  // Check localStorage
  const storedToken = localStorage.getItem(GOOGLE_TOKEN_KEY)
  if (storedToken) {
    return storedToken
  }

  // Fall back to environment variable
  const envToken = import.meta.env.VITE_GOOGLE_MAPS_API_KEY
  if (envToken) {
    return envToken
  }

  return null
}

/**
 * Check if a Google token is configured
 */
export function hasGoogleToken(): boolean {
  return getEffectiveGoogleToken() !== null
}

/**
 * Save Google token to localStorage for persistence
 */
export function saveGoogleToken(token: string): void {
  localStorage.setItem(GOOGLE_TOKEN_KEY, token)
}

/**
 * Clear saved Google token
 */
export function clearGoogleToken(): void {
  localStorage.removeItem(GOOGLE_TOKEN_KEY)
}

// ============================================================================
// Foursquare Token Management
// ============================================================================

const FOURSQUARE_TOKEN_KEY = 'map2places_foursquare_token'

/**
 * Get the effective Foursquare API token
 * Prioritizes: localStorage > environment variable
 * @returns The Foursquare token or null if not configured
 */
export function getEffectiveFoursquareToken(): string | null {
  // Check localStorage
  const storedToken = localStorage.getItem(FOURSQUARE_TOKEN_KEY)
  if (storedToken) {
    return storedToken
  }

  // Fall back to environment variable
  const envToken = import.meta.env.VITE_FOURSQUARE_API_KEY
  if (envToken) {
    return envToken
  }

  return null
}

/**
 * Check if a Foursquare token is configured
 */
export function hasFoursquareToken(): boolean {
  return getEffectiveFoursquareToken() !== null
}

/**
 * Save Foursquare token to localStorage for persistence
 */
export function saveFoursquareToken(token: string): void {
  localStorage.setItem(FOURSQUARE_TOKEN_KEY, token)
}

/**
 * Clear saved Foursquare token
 */
export function clearFoursquareToken(): void {
  localStorage.removeItem(FOURSQUARE_TOKEN_KEY)
}
