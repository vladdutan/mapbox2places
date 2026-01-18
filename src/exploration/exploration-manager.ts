/**
 * Exploration lifecycle management
 * Handles starting, stopping, and tracking explorations
 */

import { ExplorationStatus } from '../types/exploration.types'
import type { Exploration, ExplorationStats, Region } from '../types/exploration.types'
import { calculateTileGrid } from './tile-calculator'
import { addExploration, setCurrentExploration, setTiles, getTileSize, getSelectedCategories } from '../state/store'

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
  const tileSize = getTileSize()
  const categories = getSelectedCategories()

  // Generate tile grid
  const tiles = calculateTileGrid(region.bounds, tileSize, region.id)

  // Create initial stats
  const stats: ExplorationStats = {
    tilesTotal: tiles.length,
    tilesCompleted: 0,
    tilesFailed: 0,
    placesFound: 0,
    requestsMade: 0,
    estimatedCost: 0
  }

  // Create exploration record
  const exploration: Exploration = {
    id: crypto.randomUUID(),
    regionId: region.id,
    categories,
    tileSize,
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
