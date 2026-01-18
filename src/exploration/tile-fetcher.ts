/**
 * Tile fetching engine
 * Processes tiles concurrently and updates exploration progress
 */

import { TileStatus, ExplorationStatus } from '../types/exploration.types'
import type { Exploration, Tile, Place } from '../types/exploration.types'
import type { TileCompletedPayload, TileFailedPayload, ExplorationCompletedPayload, PlaceFetchedPayload } from '../types/events.types'
import { fetchPlacesByCategory, mapSearchFeatureToPlace } from '../api/category-search'
import { getTileCenter } from './tile-calculator'
import { getTiles, updateTileStatus, updateExploration, getCurrentExploration, addPlaces } from '../state/store'
import { logError } from '../utils/logger'

/**
 * Initialize the tile fetcher
 * Listens for exploration:started events and begins fetching
 */
export function initializeTileFetcher(): void {
  window.addEventListener('exploration:started', ((e: CustomEvent<{ exploration: Exploration; tileCount: number }>) => {
    const { exploration } = e.detail
    processTiles(exploration)
  }) as EventListener)
}

/**
 * Resume an incomplete exploration
 * Called when restoring an exploration that was interrupted
 */
export function resumeExploration(exploration: Exploration): void {
  const tiles = getTiles(exploration.id)
  const pendingTiles = tiles.filter(t => t.status === TileStatus.Pending)

  if (pendingTiles.length === 0) {
    console.log(`Exploration ${exploration.id} has no pending tiles to resume`)
    return
  }

  console.log(`Resuming exploration ${exploration.id} with ${pendingTiles.length} pending tiles`)
  processTiles(exploration)
}

/**
 * Process all tiles for an exploration
 * Uses controlled concurrency to avoid overwhelming the API
 */
async function processTiles(exploration: Exploration): Promise<void> {
  const tiles = getTiles(exploration.id)
  const pendingTiles = tiles.filter(t => t.status === TileStatus.Pending)

  // Process tiles in controlled batches to avoid rate limiting
  const CONCURRENT_TILES = 3 // Process 3 tiles at a time

  for (let i = 0; i < pendingTiles.length; i += CONCURRENT_TILES) {
    const batch = pendingTiles.slice(i, i + CONCURRENT_TILES)
    const promises = batch.map(tile => processSingleTile(exploration, tile))
    await Promise.allSettled(promises)
  }

  // Check if exploration is complete
  checkExplorationComplete(exploration.id)
}

/**
 * Process a single tile - fetches places for all categories
 */
async function processSingleTile(exploration: Exploration, tile: Tile): Promise<void> {
  const { id: explorationId, categories, regionId } = exploration

  // Mark tile as fetching
  updateTileStatus(explorationId, tile.id, TileStatus.Fetching)

  try {
    // Get tile center for API request
    const center = getTileCenter(tile)

    // Fetch places for all categories in this tile
    const allPlaces: Place[] = []
    let requestCount = 0

    for (const category of categories) {
      const features = await fetchPlacesByCategory(category, center, tile.bounds)
      requestCount++

      // Convert to Place objects
      const places = features.map(feature =>
        mapSearchFeatureToPlace(feature, tile.id, regionId)
      )
      allPlaces.push(...places)
    }

    // Add places to state (handles deduplication)
    if (allPlaces.length > 0) {
      addPlaces(regionId, allPlaces)

      // Dispatch place:fetched event
      window.dispatchEvent(new CustomEvent<PlaceFetchedPayload>('place:fetched', {
        detail: {
          explorationId,
          tileId: tile.id,
          places: allPlaces
        }
      }))
    }

    // Mark tile as complete
    updateTileStatus(explorationId, tile.id, TileStatus.Complete)

    // Update exploration stats
    updateExplorationStats(explorationId, {
      tilesCompleted: 1,
      placesFound: allPlaces.length,
      requestsMade: requestCount
    })

    // Dispatch tile:completed event
    window.dispatchEvent(new CustomEvent<TileCompletedPayload>('tile:completed', {
      detail: {
        explorationId,
        tileId: tile.id,
        placesFound: allPlaces.length
      }
    }))

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'

    // Log the error
    logError(`Tile ${tile.id} failed`, {
      explorationId,
      tileId: tile.id,
      bounds: tile.bounds,
      error: errorMessage
    })

    // Mark tile as failed
    updateTileStatus(explorationId, tile.id, TileStatus.Failed)

    // Update exploration stats (count requests made before failure)
    updateExplorationStats(explorationId, {
      tilesFailed: 1,
      requestsMade: 1
    })

    // Dispatch tile:failed event
    window.dispatchEvent(new CustomEvent<TileFailedPayload>('tile:failed', {
      detail: {
        explorationId,
        tileId: tile.id,
        error: errorMessage
      }
    }))
  }
}

/**
 * Update exploration stats incrementally
 */
function updateExplorationStats(
  explorationId: string,
  increments: { tilesCompleted?: number; tilesFailed?: number; placesFound?: number; requestsMade?: number }
): void {
  const exploration = getCurrentExploration()
  if (!exploration || exploration.id !== explorationId) return

  const newStats = {
    ...exploration.stats,
    tilesCompleted: exploration.stats.tilesCompleted + (increments.tilesCompleted || 0),
    tilesFailed: exploration.stats.tilesFailed + (increments.tilesFailed || 0),
    placesFound: exploration.stats.placesFound + (increments.placesFound || 0),
    requestsMade: exploration.stats.requestsMade + (increments.requestsMade || 0)
  }

  // Calculate estimated cost ($1.70 per 1000 requests)
  // Note: Mapbox has a free tier of 25k requests/month - see https://www.mapbox.com/pricing
  newStats.estimatedCost = (newStats.requestsMade / 1000) * 1.70

  updateExploration(explorationId, { stats: newStats })
}

/**
 * Check if exploration is complete and update status
 */
function checkExplorationComplete(explorationId: string): void {
  const exploration = getCurrentExploration()
  if (!exploration || exploration.id !== explorationId) return

  const tiles = getTiles(explorationId)
  const allComplete = tiles.every(t => t.status === TileStatus.Complete || t.status === TileStatus.Failed)

  if (allComplete) {
    updateExploration(explorationId, {
      status: ExplorationStatus.Completed,
      completedAt: new Date().toISOString()
    })

    // Dispatch exploration:completed event
    window.dispatchEvent(new CustomEvent<ExplorationCompletedPayload>('exploration:completed', {
      detail: {
        explorationId,
        stats: exploration.stats
      }
    }))
  }
}
