/**
 * Region boundary visualization on the map
 * Draws a highlighted bounding box for the selected region
 */

import type { GeoJSONSource } from 'mapbox-gl'
import type { Bounds, Region } from '../types/exploration.types'
import { getMap } from './map'
import { getCurrentRegion } from '../state/store'
import type { RegionSelectedPayload } from '../ui/search-results'

const REGION_SOURCE_ID = 'region-bounds'
const REGION_FILL_LAYER_ID = 'region-fill'
const REGION_LINE_LAYER_ID = 'region-line'

// Layer styling
const FILL_COLOR = 'rgba(59, 130, 246, 0.1)' // blue-500 with 10% opacity
const LINE_COLOR = 'rgba(59, 130, 246, 0.8)' // blue-500 with 80% opacity
const LINE_WIDTH = 2

/**
 * Initialize region layer on the map
 * Sets up source and layers for region boundary visualization
 */
export function initializeRegionLayer(): void {
  const map = getMap()
  if (!map) {
    console.warn('Map not ready for region layer initialization')
    return
  }

  // Add empty GeoJSON source
  if (!map.getSource(REGION_SOURCE_ID)) {
    map.addSource(REGION_SOURCE_ID, {
      type: 'geojson',
      data: createEmptyFeatureCollection()
    })
  }

  // Add fill layer
  if (!map.getLayer(REGION_FILL_LAYER_ID)) {
    map.addLayer({
      id: REGION_FILL_LAYER_ID,
      type: 'fill',
      source: REGION_SOURCE_ID,
      paint: {
        'fill-color': FILL_COLOR
      }
    })
  }

  // Add line layer for border
  if (!map.getLayer(REGION_LINE_LAYER_ID)) {
    map.addLayer({
      id: REGION_LINE_LAYER_ID,
      type: 'line',
      source: REGION_SOURCE_ID,
      paint: {
        'line-color': LINE_COLOR,
        'line-width': LINE_WIDTH
      }
    })
  }

  // Listen for region selection events
  window.addEventListener('region:selected', ((e: CustomEvent<RegionSelectedPayload>) => {
    showRegionBoundary(e.detail.region)
  }) as EventListener)

  // Listen for state changes to update UI
  window.addEventListener('state:changed', ((e: CustomEvent<{ type: string }>) => {
    if (e.detail.type === 'region') {
      const region = getCurrentRegion()
      if (region) {
        showRegionBoundary(region)
      } else {
        clearRegionBoundary()
      }
    }
  }) as EventListener)
}

/**
 * Show the boundary for a region on the map
 * @param region - The region to display
 */
export function showRegionBoundary(region: Region): void {
  const map = getMap()
  if (!map) return

  const source = map.getSource(REGION_SOURCE_ID) as GeoJSONSource | undefined
  if (!source) {
    console.warn('Region source not found')
    return
  }

  const polygon = boundsToPolygon(region.bounds)
  source.setData({
    type: 'FeatureCollection',
    features: [polygon]
  })
}

/**
 * Clear the region boundary from the map
 */
export function clearRegionBoundary(): void {
  const map = getMap()
  if (!map) return

  const source = map.getSource(REGION_SOURCE_ID) as GeoJSONSource | undefined
  if (source) {
    source.setData(createEmptyFeatureCollection())
  }
}

/**
 * Convert bounds to a GeoJSON polygon feature
 * @param bounds - [west, south, east, north] coordinates
 */
function boundsToPolygon(bounds: Bounds): GeoJSON.Feature<GeoJSON.Polygon> {
  const [west, south, east, north] = bounds

  return {
    type: 'Feature',
    properties: {},
    geometry: {
      type: 'Polygon',
      coordinates: [[
        [west, south],
        [east, south],
        [east, north],
        [west, north],
        [west, south] // Close the polygon
      ]]
    }
  }
}

/**
 * Create an empty GeoJSON FeatureCollection
 */
function createEmptyFeatureCollection(): GeoJSON.FeatureCollection {
  return {
    type: 'FeatureCollection',
    features: []
  }
}
