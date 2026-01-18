/**
 * Application state types
 */

import type { Exploration, Place, Region, Tile } from './exploration.types'

export interface AppState {
  // Current UI state
  currentRegionId: string | null
  currentExplorationId: string | null
  selectedPlaceId: string | null

  // Data collections (in-memory cache)
  regions: Region[]
  tiles: Map<string, Tile[]> // keyed by explorationId
  places: Map<string, Place[]> // keyed by regionId
  explorations: Exploration[]

  // UI state
  isSearching: boolean
  isMapReady: boolean
  modalOpen: boolean

  // Configuration state
  tileSize: number // Tile size in meters (250, 500, 1000, 2000)
  selectedCategories: string[] // POI categories for exploration

  // Session-only state (not persisted)
  mapboxToken: string | null // Mapbox API token entered by user
}

export interface StateUpdate {
  type: 'region' | 'tile' | 'place' | 'exploration' | 'ui'
  payload: Partial<AppState>
}
