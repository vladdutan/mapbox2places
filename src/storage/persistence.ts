/**
 * Auto-persistence layer
 * Listens to state changes and persists data to IndexedDB
 */

import {
  initDatabase,
  saveRegion,
  deleteRegion,
  saveExploration,
  saveTiles,
  savePlaces,
  getAllRegions,
  getAllExplorations,
  getPlacesByRegionId,
  getTilesByExplorationId
} from './db'
import {
  getState,
  getCurrentExploration,
  getTiles,
  restoreRegions,
  restoreExplorations,
  restorePlaces,
  restoreTiles,
  notifyRestoreComplete,
  setCurrentExploration,
  setCurrentRegion
} from '../state/store'
import { ExplorationStatus, TileStatus } from '../types/exploration.types'
import type { Exploration } from '../types/exploration.types'
import type { PlaceFetchedPayload } from '../types/events.types'
import { resumeExploration } from '../exploration/tile-fetcher'

/**
 * Initialize auto-persistence
 * Sets up listeners for state changes and persists data to IndexedDB
 */
export async function initializePersistence(): Promise<void> {
  // Initialize database first
  await initDatabase()

  // Listen for region changes
  window.addEventListener('state:changed', ((e: Event) => {
    const customEvent = e as CustomEvent<{ type: string }>
    const { type } = customEvent.detail

    if (type === 'region') {
      persistRegions()
    }

    if (type === 'exploration') {
      persistExploration()
    }

    if (type === 'tile') {
      persistTiles()
    }
  }) as EventListener)

  // Listen for place:fetched events to persist places immediately
  window.addEventListener('place:fetched', ((e: Event) => {
    const customEvent = e as CustomEvent<PlaceFetchedPayload>
    const { places } = customEvent.detail
    if (places.length > 0) {
      savePlaces(places).catch(err => {
        console.error('Failed to persist places:', err)
      })
    }
  }) as EventListener)
}

/**
 * Persist all regions to IndexedDB
 * Also removes regions that are no longer in state
 */
async function persistRegions(): Promise<void> {
  const state = getState()
  const currentRegions = state.regions
  const currentRegionIds = new Set(currentRegions.map(r => r.id))

  try {
    // Get stored regions to find which ones to delete
    const storedRegions = await getAllRegions()

    // Delete regions that are no longer in state
    for (const stored of storedRegions) {
      if (!currentRegionIds.has(stored.id)) {
        await deleteRegion(stored.id)
        console.log(`Deleted region ${stored.id} from storage`)
      }
    }

    // Save all current regions
    for (const region of currentRegions) {
      await saveRegion(region)
    }
  } catch (err) {
    console.error('Failed to persist regions:', err)
  }
}

/**
 * Persist current exploration to IndexedDB
 */
async function persistExploration(): Promise<void> {
  const exploration = getCurrentExploration()
  if (!exploration) return

  try {
    await saveExploration(exploration)
  } catch (err) {
    console.error('Failed to persist exploration:', err)
  }
}

/**
 * Persist tiles for current exploration to IndexedDB
 */
async function persistTiles(): Promise<void> {
  const exploration = getCurrentExploration()
  if (!exploration) return

  const tiles = getTiles(exploration.id)
  if (tiles.length === 0) return

  try {
    await saveTiles(exploration.id, tiles)
  } catch (err) {
    console.error('Failed to persist tiles:', err)
  }
}

/**
 * Restore all data from IndexedDB to application state
 * Called during app initialization
 */
export async function restoreFromStorage(): Promise<void> {
  try {
    // Initialize database
    await initDatabase()

    // Load regions
    const regions = await getAllRegions()
    if (regions.length > 0) {
      restoreRegions(regions)
      console.log(`Restored ${regions.length} regions from storage`)
    }

    // Load explorations
    const explorations = await getAllExplorations()
    if (explorations.length > 0) {
      restoreExplorations(explorations)
      console.log(`Restored ${explorations.length} explorations from storage`)
    }

    // Load places for each region
    for (const region of regions) {
      const places = await getPlacesByRegionId(region.id)
      if (places.length > 0) {
        restorePlaces(region.id, places)
        console.log(`Restored ${places.length} places for region ${region.name}`)
      }
    }

    // Load tiles for each exploration
    for (const exploration of explorations) {
      const tiles = await getTilesByExplorationId(exploration.id)
      if (tiles.length > 0) {
        restoreTiles(exploration.id, tiles)
        console.log(`Restored ${tiles.length} tiles for exploration ${exploration.id}`)
      }
    }

    // Set the most recent exploration as current (so markers display)
    if (explorations.length > 0) {
      // Prefer incomplete explorations, otherwise use the most recent one
      const incompleteExploration = findIncompleteExploration(explorations)
      const explorationToShow = incompleteExploration || explorations[explorations.length - 1]

      setCurrentRegion(explorationToShow.regionId)
      setCurrentExploration(explorationToShow.id)

      // Resume incomplete exploration after a short delay
      if (incompleteExploration) {
        setTimeout(() => {
          resumeExploration(incompleteExploration)
        }, 500)
      }
    } else if (regions.length > 0) {
      // No explorations but have regions - set the first region as current
      setCurrentRegion(regions[0].id)
    }

    // Notify UI that restore is complete
    if (regions.length > 0 || explorations.length > 0) {
      notifyRestoreComplete()
    }
  } catch (err) {
    console.error('Failed to restore from storage:', err)
  }
}

/**
 * Find an exploration that was interrupted and needs to be resumed
 * Returns the first exploration with Running status that has pending tiles
 */
function findIncompleteExploration(explorations: Exploration[]): Exploration | undefined {
  // Find explorations that were running when the page was closed
  const runningExplorations = explorations.filter(
    exp => exp.status === ExplorationStatus.Running
  )

  if (runningExplorations.length === 0) {
    return undefined
  }

  // Return the first one (could be enhanced to show a picker if multiple)
  const exploration = runningExplorations[0]

  // Verify it has pending tiles (after restoration, Fetching tiles become Pending)
  const tiles = getTiles(exploration.id)
  const pendingTiles = tiles.filter(t => t.status === TileStatus.Pending)

  if (pendingTiles.length > 0) {
    console.log(`Found incomplete exploration: ${exploration.id} with ${pendingTiles.length} pending tiles`)
    return exploration
  }

  return undefined
}
