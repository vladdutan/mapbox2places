/**
 * IndexedDB storage layer
 * Provides persistent storage for regions, explorations, tiles, and places
 */

import type { Region, Exploration, Tile, Place } from '../types/exploration.types'

const DB_NAME = 'map2places'
const DB_VERSION = 1

// Store names
const STORES = {
  regions: 'regions',
  explorations: 'explorations',
  tiles: 'tiles',
  places: 'places'
} as const

let dbInstance: IDBDatabase | null = null

/**
 * Initialize IndexedDB connection
 */
export async function initDatabase(): Promise<IDBDatabase> {
  if (dbInstance) {
    return dbInstance
  }

  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION)

    request.onerror = () => {
      reject(new Error('Failed to open database'))
    }

    request.onsuccess = () => {
      dbInstance = request.result
      resolve(dbInstance)
    }

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result

      // Create object stores with indexes
      if (!db.objectStoreNames.contains('regions')) {
        const regionsStore = db.createObjectStore('regions', { keyPath: 'id' })
        regionsStore.createIndex('name', 'name', { unique: false })
      }

      if (!db.objectStoreNames.contains('tiles')) {
        const tilesStore = db.createObjectStore('tiles', { keyPath: 'id' })
        tilesStore.createIndex('regionId', 'regionId', { unique: false })
        tilesStore.createIndex('status', 'status', { unique: false })
      }

      if (!db.objectStoreNames.contains('places')) {
        const placesStore = db.createObjectStore('places', { keyPath: 'id' })
        placesStore.createIndex('regionId', 'regionId', { unique: false })
        placesStore.createIndex('tileId', 'tileId', { unique: false })
        placesStore.createIndex('mapboxId', 'mapboxId', { unique: true })
      }

      if (!db.objectStoreNames.contains('explorations')) {
        const explorationsStore = db.createObjectStore('explorations', { keyPath: 'id' })
        explorationsStore.createIndex('regionId', 'regionId', { unique: false })
        explorationsStore.createIndex('status', 'status', { unique: false })
      }
    }
  })
}

/**
 * Get database instance
 */
export function getDatabase(): IDBDatabase {
  if (!dbInstance) {
    throw new Error('Database not initialized. Call initDatabase() first.')
  }
  return dbInstance
}

/**
 * Close database connection
 */
export function closeDatabase(): void {
  if (dbInstance) {
    dbInstance.close()
    dbInstance = null
  }
}

// ============== Regions ==============

/**
 * Save a region to IndexedDB
 */
export async function saveRegion(region: Region): Promise<void> {
  const db = await initDatabase()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORES.regions, 'readwrite')
    const store = tx.objectStore(STORES.regions)
    const request = store.put(region)

    request.onerror = () => reject(new Error(`Failed to save region: ${request.error?.message}`))
    request.onsuccess = () => resolve()
  })
}

/**
 * Get all regions from IndexedDB
 */
export async function getAllRegions(): Promise<Region[]> {
  const db = await initDatabase()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORES.regions, 'readonly')
    const store = tx.objectStore(STORES.regions)
    const request = store.getAll()

    request.onerror = () => reject(new Error(`Failed to get regions: ${request.error?.message}`))
    request.onsuccess = () => resolve(request.result)
  })
}

/**
 * Delete a region from IndexedDB
 */
export async function deleteRegion(id: string): Promise<void> {
  const db = await initDatabase()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORES.regions, 'readwrite')
    const store = tx.objectStore(STORES.regions)
    const request = store.delete(id)

    request.onerror = () => reject(new Error(`Failed to delete region: ${request.error?.message}`))
    request.onsuccess = () => resolve()
  })
}

// ============== Explorations ==============

/**
 * Save an exploration to IndexedDB
 */
export async function saveExploration(exploration: Exploration): Promise<void> {
  const db = await initDatabase()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORES.explorations, 'readwrite')
    const store = tx.objectStore(STORES.explorations)
    const request = store.put(exploration)

    request.onerror = () => reject(new Error(`Failed to save exploration: ${request.error?.message}`))
    request.onsuccess = () => resolve()
  })
}

/**
 * Get all explorations from IndexedDB
 */
export async function getAllExplorations(): Promise<Exploration[]> {
  const db = await initDatabase()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORES.explorations, 'readonly')
    const store = tx.objectStore(STORES.explorations)
    const request = store.getAll()

    request.onerror = () => reject(new Error(`Failed to get explorations: ${request.error?.message}`))
    request.onsuccess = () => resolve(request.result)
  })
}

/**
 * Get exploration by region ID
 */
export async function getExplorationByRegionId(regionId: string): Promise<Exploration | undefined> {
  const db = await initDatabase()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORES.explorations, 'readonly')
    const store = tx.objectStore(STORES.explorations)
    const index = store.index('regionId')
    const request = index.get(regionId)

    request.onerror = () => reject(new Error(`Failed to get exploration: ${request.error?.message}`))
    request.onsuccess = () => resolve(request.result)
  })
}

// ============== Tiles ==============

/**
 * Save tiles to IndexedDB (batch operation)
 */
export async function saveTiles(explorationId: string, tiles: Tile[]): Promise<void> {
  const db = await initDatabase()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORES.tiles, 'readwrite')
    const store = tx.objectStore(STORES.tiles)

    // Add explorationId to each tile for indexing
    tiles.forEach(tile => {
      store.put({ ...tile, explorationId })
    })

    tx.onerror = () => reject(new Error(`Failed to save tiles: ${tx.error?.message}`))
    tx.oncomplete = () => resolve()
  })
}

/**
 * Get tiles by exploration ID
 */
export async function getTilesByExplorationId(explorationId: string): Promise<Tile[]> {
  const db = await initDatabase()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORES.tiles, 'readonly')
    const store = tx.objectStore(STORES.tiles)
    const request = store.getAll()

    request.onerror = () => reject(new Error(`Failed to get tiles: ${request.error?.message}`))
    request.onsuccess = () => {
      // Filter by explorationId since index might not exist
      const tiles = request.result.filter((t: Tile & { explorationId?: string }) =>
        t.explorationId === explorationId
      )
      resolve(tiles)
    }
  })
}

// ============== Places ==============

/**
 * Save places to IndexedDB (batch operation)
 */
export async function savePlaces(places: Place[]): Promise<void> {
  if (places.length === 0) return

  const db = await initDatabase()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORES.places, 'readwrite')
    const store = tx.objectStore(STORES.places)

    places.forEach(place => {
      store.put(place)
    })

    tx.onerror = () => reject(new Error(`Failed to save places: ${tx.error?.message}`))
    tx.oncomplete = () => resolve()
  })
}

/**
 * Get places by region ID
 */
export async function getPlacesByRegionId(regionId: string): Promise<Place[]> {
  const db = await initDatabase()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORES.places, 'readonly')
    const store = tx.objectStore(STORES.places)
    const index = store.index('regionId')
    const request = index.getAll(regionId)

    request.onerror = () => reject(new Error(`Failed to get places: ${request.error?.message}`))
    request.onsuccess = () => resolve(request.result)
  })
}

/**
 * Clear all data from all stores
 */
export async function clearAllData(): Promise<void> {
  const db = await initDatabase()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(
      [STORES.regions, STORES.explorations, STORES.tiles, STORES.places],
      'readwrite'
    )

    tx.objectStore(STORES.regions).clear()
    tx.objectStore(STORES.explorations).clear()
    tx.objectStore(STORES.tiles).clear()
    tx.objectStore(STORES.places).clear()

    tx.onerror = () => reject(new Error(`Failed to clear data: ${tx.error?.message}`))
    tx.oncomplete = () => resolve()
  })
}
