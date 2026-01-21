/**
 * Tile fetching engine
 * Processes tiles concurrently across multiple providers
 */

import { TileStatus, ExplorationStatus } from '../types/exploration.types'
import type { Exploration, Tile, Place } from '../types/exploration.types'
import type { TileCompletedPayload, ExplorationCompletedPayload, PlaceFetchedPayload } from '../types/events.types'
import { Provider, PROVIDER_COSTS } from '../types/provider.types'
import { getEnabledProviders } from '../api/providers'
import { getTileCenter } from './tile-calculator'
import { getTiles, updateTileStatus, updateTileProviderStatus, updateExploration, getCurrentExploration, addPlaces } from '../state/store'


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

  // Process tiles using per-provider queues to ensure fast providers aren't blocked by slow ones
  const CONCURRENT_MAPBOX = 6
  const CONCURRENT_GOOGLE = 6

  // Create queues for each provider
  const tasks: (() => Promise<void>)[] = []

  const enabledProviders = exploration.enabledProviders

  // Helper to process a single provider for a single tile
  const createProviderTask = (tile: Tile, provider: Provider) => async () => {
    try {
      await processTileProvider(exploration, tile, provider)
    } catch (e) {
      console.error(`Task failed for tile ${tile.id} provider ${provider}`, e)
    }
  }

  // Fill queues
  for (const tile of pendingTiles) {
    // Mark tile as fetching immediately
    updateTileStatus(exploration.id, tile.id, TileStatus.Fetching)
    
    // Initialize provider status if needed
    if (!tile.providerStatus) {
      // We need to set initial pending status for all enabled providers
      // This logic should ideally be in store/creation, but ensuring it here is safe
    }

    const providers = getEnabledProviders(enabledProviders)
    for (const provider of providers) {
      tasks.push(createProviderTask(tile, provider.getProvider()))
    }
  }

  // Execute tasks with primitive concurrency control
  // We'll define a simple runner that categorizes tasks by provider for concurrency limits
  
  // Actually, simpler approach for now:
  // We will iterate through all tiles and fire off provider requests, 
  // but we need to limit them.
  // Since we don't have a queue library, we'll use a simple pool per provider.
  
  const mapboxQueue: (() => Promise<void>)[] = []
  const googleQueue: (() => Promise<void>)[] = []

  // Distribute tasks
  for (const tile of pendingTiles) {
     const providers = getEnabledProviders(enabledProviders)
     for (const provider of providers) {
       const pId = provider.getProvider()
       const task = createProviderTask(tile, pId)
       
       if (pId === Provider.Mapbox) mapboxQueue.push(task)
       else if (pId === Provider.Google) googleQueue.push(task)
     }
  }

  // Run queues independently
  const runQueue = async (queue: (() => Promise<void>)[], limit: number) => {
    const running: Promise<void>[] = []
    for (const task of queue) {
      // wait if limit reached
      while (running.length >= limit) {
        await Promise.race(running)
      }
      
      const p = task().then(() => {
        running.splice(running.indexOf(p), 1)
      })
      running.push(p)
    }
    await Promise.all(running)
  }

  // Fire them all off "separately"
  await Promise.all([
    runQueue(mapboxQueue, CONCURRENT_MAPBOX),
    runQueue(googleQueue, CONCURRENT_GOOGLE)
  ])

  // Check completion after all queues are done
  checkExplorationComplete(exploration.id)
}

/**
 * Process a single provider for a single tile
 * Decoupled from other providers for the same tile
 */
async function processTileProvider(exploration: Exploration, tile: Tile, providerId: Provider): Promise<void> {
  const { id: explorationId, categories, regionId } = exploration
  const provider = getEnabledProviders([providerId])[0]
  
  if (!provider) return

  // Get tile center
  const center = getTileCenter(tile)
  
  let placesCount = 0
  let requestsCount = 0
  let errorCount = 0

  for (const category of categories) {
    try {
      const providerPlaces = await provider.fetchPlaces(category, center, tile.bounds)
      requestsCount++

      // Convert to Place objects
      const places: Place[] = providerPlaces.map(pp => ({
        id: crypto.randomUUID(),
        tileId: tile.id,
        regionId,
        provider: providerId,
        providerId: pp.providerId,
        name: pp.name,
        category: pp.category,
        coordinates: pp.coordinates,
        metadata: {
          address: pp.address,
          fullAddress: pp.fullAddress,
          ...pp.metadata
        }
      }))

      placesCount += places.length
      
      // Add places IMMEDIATELY so they show up on map
      if (places.length > 0) {
        addPlaces(regionId, places)
        
        window.dispatchEvent(new CustomEvent<PlaceFetchedPayload>('place:fetched', {
          detail: {
            explorationId,
            tileId: tile.id,
            places
          }
        }))
      }

      console.log(`Tile ${tile.id} - ${provider.getName()}: ${places.length} places for ${category}`)
    } catch (error) {
       errorCount++
       console.error(`Provider ${provider.getName()} failed for tile ${tile.id}`, error)
    }
  }

  // Update provider status
  const providerKey = providerId === Provider.Mapbox ? 'mapbox' : 'google'
  const status = errorCount > 0 && placesCount === 0 ? 'error' : 'complete'
  updateTileProviderStatus(explorationId, tile.id, providerKey, status)

  // Update global stats
  updateExplorationStatsMultiProvider(explorationId, {
    placesFound: placesCount,
    requestsMade: requestsCount,
    providerResults: {
      [Provider.Mapbox]: { places: 0, requests: 0, errors: 0 },
      [Provider.Google]: { places: 0, requests: 0, errors: 0 },
      [providerId]: { places: placesCount, requests: requestsCount, errors: errorCount }
    }
  })

  // Check if tile is fully complete (all enabled providers finish)
  checkTileCompletion(exploration, tile.id)
}

/**
 * Check if a tile is fully complete based on enabled providers
 */
function checkTileCompletion(exploration: Exploration, tileId: string) {
  const currentTiles = getTiles(exploration.id)
  const tile = currentTiles.find(t => t.id === tileId)
  if (!tile) return

  const enabledIds = exploration.enabledProviders
  const status = tile.providerStatus || {}
  
  const allDone = enabledIds.every(pid => {
    const key = pid === Provider.Mapbox ? 'mapbox' : 'google'
    return status[key] === 'complete' || status[key] === 'error'
  })

  if (allDone) {
    updateTileStatus(exploration.id, tileId, TileStatus.Complete)
    
    // Dispatch tile:completed
    window.dispatchEvent(new CustomEvent<TileCompletedPayload>('tile:completed', {
      detail: {
        explorationId: exploration.id,
        tileId,
        placesFound: 0 // Already counted incrementally
      }
    }))
  }
}

/**
 * Update exploration stats with per-provider breakdown
 */
function updateExplorationStatsMultiProvider(
  explorationId: string,
  increments: {
    tilesCompleted?: number
    tilesFailed?: number
    placesFound?: number
    requestsMade?: number
    providerResults: Record<Provider, { places: number; requests: number; errors: number }>
  }
): void {
  const exploration = getCurrentExploration()
  if (!exploration || exploration.id !== explorationId) return

  // Calculate per-provider stats
  const newProviderStats = { ...exploration.stats.providerStats }
  for (const [providerId, results] of Object.entries(increments.providerResults)) {
    const provider = providerId as Provider
    const existing = newProviderStats[provider] || { placesFound: 0, requestsMade: 0, estimatedCost: 0, errors: 0 }
    const costPer1000 = PROVIDER_COSTS[provider] || 0

    newProviderStats[provider] = {
      placesFound: existing.placesFound + results.places,
      requestsMade: existing.requestsMade + results.requests,
      estimatedCost: ((existing.requestsMade + results.requests) / 1000) * costPer1000,
      errors: existing.errors + results.errors
    }
  }

  // Calculate aggregate totals
  let totalPlaces = 0
  let totalRequests = 0
  let totalCost = 0
  for (const stats of Object.values(newProviderStats)) {
    if (stats) {
      totalPlaces += stats.placesFound
      totalRequests += stats.requestsMade
      totalCost += stats.estimatedCost
    }
  }

  const newStats = {
    ...exploration.stats,
    tilesCompleted: exploration.stats.tilesCompleted + (increments.tilesCompleted || 0),
    tilesFailed: exploration.stats.tilesFailed + (increments.tilesFailed || 0),
    placesFound: totalPlaces,
    requestsMade: totalRequests,
    estimatedCost: totalCost,
    providerStats: newProviderStats
  }

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
