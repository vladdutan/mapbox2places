/**
 * Map-related type definitions
 */

import type { Map as MapboxMap, LngLatLike } from 'mapbox-gl'

/**
 * Map configuration options
 */
export interface MapConfig {
  container: string | HTMLElement
  accessToken: string
  style: string
  center: LngLatLike
  zoom: number
}

/**
 * Map ready event payload
 */
export interface MapReadyPayload {
  map: MapboxMap
}

/**
 * Map click event payload
 */
export interface MapClickPayload {
  coordinates: [number, number]
  features: unknown[]
}

/**
 * Default map configuration for Europe view
 */
export const DEFAULT_MAP_CONFIG: Omit<MapConfig, 'container' | 'accessToken'> = {
  style: 'mapbox://styles/mapbox/streets-v12',
  center: [10, 50], // Central Europe
  zoom: 4
}
