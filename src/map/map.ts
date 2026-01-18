/**
 * Mapbox GL JS map initialization and management
 */

import mapboxgl from 'mapbox-gl'
import type { Map as MapboxMap } from 'mapbox-gl'
import type { MapConfig, MapReadyPayload } from '../types/map.types'
import { DEFAULT_MAP_CONFIG } from '../types/map.types'
import { setUIState } from '../state/store'
import { getEffectiveMapboxToken } from '../utils/config'

let mapInstance: MapboxMap | null = null

/**
 * Initialize the Mapbox map with the given configuration
 * @param container - DOM element or ID for the map container
 * @returns Promise that resolves when the map is ready
 */
export function initializeMap(container: string | HTMLElement): Promise<MapboxMap> {
  const accessToken = getEffectiveMapboxToken()

  if (!accessToken) {
    throw new Error('Mapbox access token not configured. Enter your API key or set VITE_MAPBOX_TOKEN in .env file.')
  }

  mapboxgl.accessToken = accessToken

  const config: MapConfig = {
    container,
    accessToken,
    ...DEFAULT_MAP_CONFIG
  }

  return new Promise((resolve, reject) => {
    try {
      const map = new mapboxgl.Map({
        container: config.container,
        style: config.style,
        center: config.center,
        zoom: config.zoom
      })

      // Add navigation controls (zoom buttons + compass)
      map.addControl(new mapboxgl.NavigationControl(), 'top-right')

      // Wait for map to be fully loaded
      map.on('load', () => {
        mapInstance = map
        setUIState({ isMapReady: true })

        // Dispatch map:ready event
        window.dispatchEvent(new CustomEvent<MapReadyPayload>('map:ready', {
          detail: { map }
        }))

        resolve(map)
      })

      map.on('error', (e) => {
        reject(new Error(`Map initialization failed: ${e.error?.message || 'Unknown error'}`))
      })
    } catch (error) {
      reject(error instanceof Error ? error : new Error(String(error)))
    }
  })
}

/**
 * Get the current map instance
 * @returns The map instance or null if not initialized
 */
export function getMap(): MapboxMap | null {
  return mapInstance
}

/**
 * Destroy the map instance and clean up resources
 */
export function destroyMap(): void {
  if (mapInstance) {
    mapInstance.remove()
    mapInstance = null
    setUIState({ isMapReady: false })
  }
}

/**
 * Fit the map to the given bounds
 * @param bounds - [west, south, east, north] coordinates
 * @param options - Optional fit bounds options
 */
export function fitBounds(
  bounds: [number, number, number, number],
  options: { padding?: number; maxZoom?: number } = {}
): void {
  if (!mapInstance) {
    console.warn('Map not initialized')
    return
  }

  const { padding = 50, maxZoom = 14 } = options

  mapInstance.fitBounds(
    [[bounds[0], bounds[1]], [bounds[2], bounds[3]]],
    { padding, maxZoom }
  )
}

/**
 * Fly to a specific location
 * @param center - [longitude, latitude] coordinates
 * @param zoom - Zoom level (default 10)
 */
export function flyTo(center: [number, number], zoom: number = 10): void {
  if (!mapInstance) {
    console.warn('Map not initialized')
    return
  }

  mapInstance.flyTo({ center, zoom })
}
