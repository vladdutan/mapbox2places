/**
 * Exploration lifecycle management
 * Handles starting, stopping, and tracking explorations
 */

import { ExplorationStatus } from '../types/exploration.types'
import type { Exploration, ExplorationStats, Region } from '../types/exploration.types'
import { Provider } from '../types/provider.types'
import { calculateTileGrid } from './tile-calculator'
import { getEnabledProviders as getAvailableEnabledProviders } from '../api/providers'
import { addExploration, setCurrentExploration, setTiles, getTileSize, getSelectedCategories, getSelectedProviders, savePendingRegion } from '../state/store'

/**
 * Payload for exploration:started event
 */
export interface ExplorationStartedPayload {
  exploration: Exploration
  tileCount: number
}

/**
 * Start a new exploration for a region
 * Creates exploration record, generates tiles, and dispatches event
 */
export function startExploration(region: Region): Exploration {
  // Save pending region to history if it exists
  savePendingRegion()
  
  const tileSize = getTileSize()
  const categories = getSelectedCategories()
  const selectedProviders = getSelectedProviders()
  
  // Only use providers that are actually available (e.g. have API keys/loaded)
  // This prevents the exploration from hanging waiting for an unavailable provider
  const enabledProviders = getAvailableEnabledProviders(selectedProviders)
    .map(p => p.getProvider())



  // Generate tile grid
  const tiles = calculateTileGrid(region.bounds, tileSize, region.id)

  // Create initial stats with per-provider tracking
  const stats: ExplorationStats = {
    tilesTotal: tiles.length,
    tilesCompleted: 0,
    tilesFailed: 0,
    placesFound: 0,
    requestsMade: 0,
    estimatedCost: 0,
    providerStats: {
      [Provider.Mapbox]: { placesFound: 0, requestsMade: 0, estimatedCost: 0, errors: 0 },
      [Provider.Google]: { placesFound: 0, requestsMade: 0, estimatedCost: 0, errors: 0 }
    }
  }

  // Create exploration record
  const exploration: Exploration = {
    id: crypto.randomUUID(),
    regionId: region.id,
    categories,
    tileSize,
    enabledProviders,
    status: ExplorationStatus.Running,
    stats,
    startedAt: new Date().toISOString(),
    completedAt: null
  }

  // Store exploration and tiles
  addExploration(exploration)
  setTiles(exploration.id, tiles)
  setCurrentExploration(exploration.id)

  // Dispatch exploration:started event
  window.dispatchEvent(new CustomEvent<ExplorationStartedPayload>('exploration:started', {
    detail: {
      exploration,
      tileCount: tiles.length
    }
  }))

  return exploration
}

