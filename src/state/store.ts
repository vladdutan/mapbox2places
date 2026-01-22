/**
 * Central state management with event-driven updates
 * Single source of truth for application state
 */

import type { AppState } from '../types/state.types'
import type { Exploration, Region, Tile, Place, Bounds } from '../types/exploration.types'
import { TileStatus } from '../types/exploration.types'
import { Provider } from '../types/provider.types'

// Default tile size in meters
export const DEFAULT_TILE_SIZE = 500

// Available tile size options in meters
export const TILE_SIZE_OPTIONS = [250, 500, 1000, 2000] as const

// POI category options for exploration
export const POI_CATEGORIES = [
  { id: 'grocery', label: 'Grocery Stores' },
  { id: 'restaurant', label: 'Restaurants' },
  { id: 'cafe', label: 'Cafes' },
  { id: 'bar', label: 'Bars' },
  { id: 'pharmacy', label: 'Pharmacies' },
  { id: 'bank', label: 'Banks' },
  { id: 'gas_station', label: 'Gas Stations' },
  { id: 'hotel', label: 'Hotels' },
  { id: 'parking', label: 'Parking' },
] as const

// Default categories
export const DEFAULT_CATEGORIES = ['grocery']


const initialState: AppState = {
  currentRegionId: null,
  currentExplorationId: null,
  selectedPlaceId: null,
  pendingRegion: null,
  regions: [],
  tiles: new Map(),
  places: new Map(),
  explorations: [],
  isSearching: false,
  isMapReady: false,
  modalOpen: false,
  tileSize: DEFAULT_TILE_SIZE,
  selectedCategories: [...DEFAULT_CATEGORIES],
  selectedProviders: [Provider.Mapbox, Provider.Google, Provider.Foursquare], // Default: Mapbox, Google & Foursquare
  mapboxToken: null
}

// State singleton
let state: AppState = { ...initialState }

// State getters
export function getState(): Readonly<AppState> {
  return state
}

export function getCurrentRegion(): Region | undefined {
  const savedRegion = state.regions.find(r => r.id === state.currentRegionId)
  if (savedRegion) return savedRegion
  
  // Check pending region if not found in saved regions
  if (state.pendingRegion?.id === state.currentRegionId) {
    return state.pendingRegion
  }
  
  return undefined
}

export function getCurrentExploration(): Exploration | undefined {
  return state.explorations.find(e => e.id === state.currentExplorationId)
}

export function getExplorationByRegion(regionId: string): Exploration | undefined {
  return state.explorations.find(e => e.regionId === regionId)
}

export function getAllExplorations(): readonly Exploration[] {
  return state.explorations
}

// State setters with event dispatch
export function setCurrentRegion(regionId: string | null): void {
  state = { ...state, currentRegionId: regionId }
  dispatchStateChange('region')
}

export function setCurrentExploration(explorationId: string | null): void {
  state = { ...state, currentExplorationId: explorationId }
  dispatchStateChange('exploration')
}

export function addRegion(region: Region): void {
  state = { ...state, regions: [...state.regions, region] }
  dispatchStateChange('region')
}

export function removeRegion(regionId: string): void {
  const newRegions = state.regions.filter(r => r.id !== regionId)
  
  // Clean up associated explorations
  const explorationsToRemove = state.explorations.filter(e => e.regionId === regionId)
  const newExplorations = state.explorations.filter(e => e.regionId !== regionId)
  
  // Clean up associated tiles
  const newTiles = new Map(state.tiles)
  explorationsToRemove.forEach(e => newTiles.delete(e.id))
  
  // Clean up associated places
  const newPlaces = new Map(state.places)
  newPlaces.delete(regionId)

  // Determine new current region
  const newCurrentRegionId = state.currentRegionId === regionId
    ? (newRegions.length > 0 ? newRegions[0].id : null)
    : state.currentRegionId

  // If we switched regions, we need to find the new current exploration
  let newCurrentExplorationId = state.currentExplorationId
  if (state.currentRegionId === regionId) {
    if (newCurrentRegionId) {
       const nextExploration = newExplorations.find(e => e.regionId === newCurrentRegionId)
       newCurrentExplorationId = nextExploration?.id || null
    } else {
      newCurrentExplorationId = null
    }
  }

  state = {
    ...state,
    regions: newRegions,
    explorations: newExplorations,
    tiles: newTiles,
    places: newPlaces,
    currentRegionId: newCurrentRegionId,
    currentExplorationId: newCurrentExplorationId
  }
  dispatchStateChange('region')
  dispatchStateChange('exploration')
  // We don't dispatch tile/place changes explicitly as they aren't usually displayed without a region selected,
  // but dispatching them wouldn't hurt. For now, region/exploration should trigger enough UI updates.
}

export function updateRegionBounds(regionId: string, bounds: Bounds): void {
  // Update saved regions
  const updatedRegions = state.regions.map(r =>
    r.id === regionId ? { ...r, bounds } : r
  )

  // Update pending region if it matches
  const updatedPendingRegion = state.pendingRegion?.id === regionId
    ? { ...state.pendingRegion, bounds }
    : state.pendingRegion

  state = {
    ...state,
    regions: updatedRegions,
    pendingRegion: updatedPendingRegion
  }
  dispatchStateChange('region')
}

export function getRegions(): readonly Region[] {
  return state.regions
}

export function getPendingRegion(): Region | null {
  return state.pendingRegion
}

export function setPendingRegion(region: Region | null): void {
  // Clear stale exploration when setting a pending region
  state = { 
    ...state, 
    pendingRegion: region, 
    currentRegionId: region?.id || null,
    currentExplorationId: null 
  }
  dispatchStateChange('region')
  dispatchStateChange('exploration')
}

export function savePendingRegion(): void {
  if (state.pendingRegion) {
    state = { 
      ...state, 
      regions: [...state.regions, state.pendingRegion],
      pendingRegion: null 
    }
    dispatchStateChange('region')
  }
}

export function addExploration(exploration: Exploration): void {
  state = { ...state, explorations: [...state.explorations, exploration] }
  dispatchStateChange('exploration')
}

export function updateExploration(id: string, updates: Partial<Exploration>): void {
  state = {
    ...state,
    explorations: state.explorations.map(exp =>
      exp.id === id ? { ...exp, ...updates } : exp
    )
  }
  dispatchStateChange('exploration')
}

export function setTiles(explorationId: string, tiles: Tile[]): void {
  const newTiles = new Map(state.tiles)
  newTiles.set(explorationId, tiles)
  state = { ...state, tiles: newTiles }
  dispatchStateChange('tile')
}

export function getTiles(explorationId: string): Tile[] {
  return state.tiles.get(explorationId) || []
}

export function updateTileStatus(explorationId: string, tileId: string, status: TileStatus): void {
  const tiles = state.tiles.get(explorationId)
  if (!tiles) return

  const updatedTiles = tiles.map(tile =>
    tile.id === tileId
      ? { ...tile, status, fetchedAt: status === TileStatus.Complete ? new Date().toISOString() : tile.fetchedAt }
      : tile
  )

  const newTiles = new Map(state.tiles)
  newTiles.set(explorationId, updatedTiles)
  state = { ...state, tiles: newTiles }
  dispatchStateChange('tile')
}

export function updateTileProviderStatus(
  explorationId: string,
  tileId: string,
  provider: 'mapbox' | 'google' | 'foursquare',
  status: 'pending' | 'complete' | 'error'
): void {
  const tiles = state.tiles.get(explorationId)
  if (!tiles) return

  const updatedTiles = tiles.map(tile => {
    if (tile.id !== tileId) return tile
    return {
      ...tile,
      providerStatus: {
        ...tile.providerStatus,
        [provider]: status
      }
    }
  })

  const newTiles = new Map(state.tiles)
  newTiles.set(explorationId, updatedTiles)
  state = { ...state, tiles: newTiles }
  dispatchStateChange('tile')
}

export function addPlaces(regionId: string, places: Place[]): void {
  const existingPlaces = state.places.get(regionId) || []

  // Filter out duplicates by provider + providerId combination
  const existingKeys = new Set(existingPlaces.map(p => `${p.provider}:${p.providerId}`))
  const newPlaces = places.filter(p => !existingKeys.has(`${p.provider}:${p.providerId}`))

  const newPlacesMap = new Map(state.places)
  newPlacesMap.set(regionId, [...existingPlaces, ...newPlaces])
  state = { ...state, places: newPlacesMap }
  dispatchStateChange('place')
}

export function getPlaces(regionId: string): Place[] {
  return state.places.get(regionId) || []
}

export function setUIState(updates: Partial<Pick<AppState, 'isSearching' | 'isMapReady' | 'modalOpen' | 'selectedPlaceId'>>): void {
  state = { ...state, ...updates }
  dispatchStateChange('ui')
}

export function getTileSize(): number {
  return state.tileSize
}

export function setTileSize(tileSize: number): void {
  state = { ...state, tileSize }
  dispatchStateChange('config')
}

export function getSelectedCategories(): string[] {
  return state.selectedCategories
}

export function setSelectedCategories(categories: string[]): void {
  state = { ...state, selectedCategories: categories }
  dispatchStateChange('config')
}

export function addCategory(category: string): void {
  if (!state.selectedCategories.includes(category)) {
    state = { ...state, selectedCategories: [...state.selectedCategories, category] }
    dispatchStateChange('config')
  }
}

export function removeCategory(category: string): void {
  state = { ...state, selectedCategories: state.selectedCategories.filter(c => c !== category) }
  dispatchStateChange('config')
}

export function getSelectedProviders(): import('../types/provider.types').Provider[] {
  return state.selectedProviders
}

export function setSelectedProviders(providers: import('../types/provider.types').Provider[]): void {
  state = { ...state, selectedProviders: providers }
  dispatchStateChange('config')
}

export function toggleSelectedProvider(provider: import('../types/provider.types').Provider): void {
  const current = state.selectedProviders
  const isSelected = current.includes(provider)
  const newSelection = isSelected
    ? current.filter(p => p !== provider)
    : [...current, provider]

  state = { ...state, selectedProviders: newSelection }
  dispatchStateChange('config')
}

export function getMapboxToken(): string | null {
  return state.mapboxToken
}

export function setMapboxToken(token: string | null): void {
  state = { ...state, mapboxToken: token }
  dispatchStateChange('config')
}

// Event dispatch helper
function dispatchStateChange(type: string): void {
  window.dispatchEvent(new CustomEvent('state:changed', {
    detail: { type, state: getState() }
  }))
}

// Reset state (useful for testing)
export function resetState(): void {
  state = { ...initialState, tiles: new Map(), places: new Map() }
}

// ============== Restore Functions (for persistence) ==============

/**
 * Restore regions from IndexedDB (no event dispatch to avoid persistence loop)
 */
export function restoreRegions(regions: Region[]): void {
  state = { ...state, regions }
}

/**
 * Restore explorations from IndexedDB (no event dispatch to avoid persistence loop)
 */
export function restoreExplorations(explorations: Exploration[]): void {
  state = { ...state, explorations }
}

/**
 * Restore places for a region from IndexedDB (no event dispatch)
 */
export function restorePlaces(regionId: string, places: Place[]): void {
  const newPlacesMap = new Map(state.places)
  newPlacesMap.set(regionId, places)
  state = { ...state, places: newPlacesMap }
}

/**
 * Restore tiles for an exploration from IndexedDB (no event dispatch)
 * Resets any 'Fetching' tiles to 'Pending' since the fetch was interrupted
 */
export function restoreTiles(explorationId: string, tiles: Tile[]): void {
  // Reset interrupted fetches to pending
  const restoredTiles = tiles.map(tile =>
    tile.status === TileStatus.Fetching
      ? { ...tile, status: TileStatus.Pending }
      : tile
  )

  const newTiles = new Map(state.tiles)
  newTiles.set(explorationId, restoredTiles)
  state = { ...state, tiles: newTiles }
}

/**
 * Trigger UI update after restore is complete
 */
export function notifyRestoreComplete(): void {
  dispatchStateChange('region')
  dispatchStateChange('exploration')
}
