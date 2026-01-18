/**
 * Tile grid visualization on the map
 * Shows tile processing status with color-coded overlays
 */

import type { GeoJSONSource } from 'mapbox-gl'
import type { Tile } from '../types/exploration.types'
import { TileStatus } from '../types/exploration.types'
import { getMap } from './map'
import { getTiles, getCurrentExploration } from '../state/store'
import { bringMarkersToFront } from './marker-layer'

const TILES_SOURCE_ID = 'exploration-tiles'
const TILES_FILL_LAYER_ID = 'tiles-fill'
const TILES_LINE_LAYER_ID = 'tiles-line'

// Status-based colors
const STATUS_COLORS: Record<TileStatus, string> = {
  [TileStatus.Pending]: 'rgba(156, 163, 175, 0.3)',   // gray-400 with 30% opacity
  [TileStatus.Fetching]: 'rgba(251, 191, 36, 0.4)',   // amber-400 with 40% opacity
  [TileStatus.Complete]: 'rgba(34, 197, 94, 0.3)',    // green-500 with 30% opacity
  [TileStatus.Failed]: 'rgba(239, 68, 68, 0.4)'       // red-500 with 40% opacity
}

const LINE_COLOR = 'rgba(107, 114, 128, 0.5)' // gray-500 with 50% opacity
const LINE_WIDTH = 0.5

let layersVisible = true

/**
 * Initialize tile layer on the map
 * Sets up source and layers for tile grid visualization
 */
export function initializeTileLayer(): void {
  const map = getMap()
  if (!map) {
    console.warn('Map not ready for tile layer initialization')
    return
  }

  // Add empty GeoJSON source
  if (!map.getSource(TILES_SOURCE_ID)) {
    map.addSource(TILES_SOURCE_ID, {
      type: 'geojson',
      data: createEmptyFeatureCollection()
    })
  }

  // Add fill layer with data-driven styling based on status
  if (!map.getLayer(TILES_FILL_LAYER_ID)) {
    map.addLayer({
      id: TILES_FILL_LAYER_ID,
      type: 'fill',
      source: TILES_SOURCE_ID,
      paint: {
        'fill-color': [
          'match',
          ['get', 'status'],
          TileStatus.Pending, STATUS_COLORS[TileStatus.Pending],
          TileStatus.Fetching, STATUS_COLORS[TileStatus.Fetching],
          TileStatus.Complete, STATUS_COLORS[TileStatus.Complete],
          TileStatus.Failed, STATUS_COLORS[TileStatus.Failed],
          STATUS_COLORS[TileStatus.Pending] // default
        ]
      }
    })
  }

  // Add line layer for tile borders
  if (!map.getLayer(TILES_LINE_LAYER_ID)) {
    map.addLayer({
      id: TILES_LINE_LAYER_ID,
      type: 'line',
      source: TILES_SOURCE_ID,
      paint: {
        'line-color': LINE_COLOR,
        'line-width': LINE_WIDTH
      }
    })
  }

  // Ensure proper layer ordering: region -> tiles -> markers
  ensureTileLayerOrder()
  bringMarkersToFront()

  // Listen for exploration and tile events
  window.addEventListener('exploration:started', () => {
    updateTileLayer()
  })

  window.addEventListener('tile:completed', () => {
    updateTileLayer()
  })

  window.addEventListener('tile:failed', () => {
    updateTileLayer()
  })

  window.addEventListener('state:changed', ((e: CustomEvent<{ type: string }>) => {
    if (e.detail.type === 'exploration' || e.detail.type === 'tile') {
      updateTileLayer()
    }
    if (e.detail.type === 'region') {
      // Clear tiles when region changes
      clearTileLayer()
    }
  }) as EventListener)
}

/**
 * Update the tile layer with current exploration tiles
 */
export function updateTileLayer(): void {
  const map = getMap()
  if (!map) return

  const source = map.getSource(TILES_SOURCE_ID) as GeoJSONSource | undefined
  if (!source) return

  const exploration = getCurrentExploration()
  if (!exploration) {
    source.setData(createEmptyFeatureCollection())
    return
  }

  const tiles = getTiles(exploration.id)
  const features = tiles.map(tile => tileToFeature(tile))

  source.setData({
    type: 'FeatureCollection',
    features
  })

  // Ensure markers stay on top after tile layer updates
  bringMarkersToFront()
}

/**
 * Clear the tile layer
 */
export function clearTileLayer(): void {
  const map = getMap()
  if (!map) return

  const source = map.getSource(TILES_SOURCE_ID) as GeoJSONSource | undefined
  if (source) {
    source.setData(createEmptyFeatureCollection())
  }
}

/**
 * Toggle visibility of tile and region layers
 */
export function setOverlayVisibility(visible: boolean): void {
  const map = getMap()
  if (!map) return

  layersVisible = visible
  const visibility = visible ? 'visible' : 'none'

  // Tile layers
  if (map.getLayer(TILES_FILL_LAYER_ID)) {
    map.setLayoutProperty(TILES_FILL_LAYER_ID, 'visibility', visibility)
  }
  if (map.getLayer(TILES_LINE_LAYER_ID)) {
    map.setLayoutProperty(TILES_LINE_LAYER_ID, 'visibility', visibility)
  }

  // Region layers
  if (map.getLayer('region-fill')) {
    map.setLayoutProperty('region-fill', 'visibility', visibility)
  }
  if (map.getLayer('region-line')) {
    map.setLayoutProperty('region-line', 'visibility', visibility)
  }

  // Ensure markers remain on top
  bringMarkersToFront()
}

/**
 * Get current visibility state
 */
export function getOverlayVisibility(): boolean {
  return layersVisible
}

/**
 * Ensure tile layers are in correct z-order (above region, below markers)
 */
function ensureTileLayerOrder(): void {
  const map = getMap()
  if (!map) return

  // Move tile layers above region layers
  if (map.getLayer('region-line') && map.getLayer(TILES_FILL_LAYER_ID)) {
    map.moveLayer(TILES_FILL_LAYER_ID)
    map.moveLayer(TILES_LINE_LAYER_ID)
  }
}

/**
 * Convert a tile to a GeoJSON feature
 */
function tileToFeature(tile: Tile): GeoJSON.Feature<GeoJSON.Polygon> {
  const [west, south, east, north] = tile.bounds

  return {
    type: 'Feature',
    properties: {
      id: tile.id,
      status: tile.status
    },
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
