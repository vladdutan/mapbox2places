/**
 * Custom event payload types for map2places
 * Event naming pattern: category:action
 */

import type { ExplorationStats, Place } from './exploration.types'

// Exploration events
export interface ExplorationStartedPayload {
  explorationId: string
  regionId: string
  category: string
  tilesTotal: number
}

export interface ExplorationCompletedPayload {
  explorationId: string
  stats: ExplorationStats
}

// Tile events
export interface TileFetchingPayload {
  explorationId: string
  tileId: string
}

export interface TileCompletedPayload {
  explorationId: string
  tileId: string
  placesFound: number
}

export interface TileFailedPayload {
  explorationId: string
  tileId: string
  error: string
}

// Place events
export interface PlaceFetchedPayload {
  explorationId: string
  tileId: string
  places: Place[]
}

export interface PlaceSelectedPayload {
  place: Place
}

// Stats events
export interface StatsUpdatedPayload {
  explorationId: string
  stats: ExplorationStats
}

// Error events
export interface ErrorPayload {
  category: ErrorCategory
  message: string
  context?: Record<string, unknown>
}

export enum ErrorCategory {
  Network = 'network',
  ApiQuota = 'api-quota',
  ApiError = 'api-error',
  Storage = 'storage',
  Unknown = 'unknown'
}

// Event map for type-safe event handling
export interface AppEventMap {
  'exploration:started': CustomEvent<ExplorationStartedPayload>
  'exploration:completed': CustomEvent<ExplorationCompletedPayload>
  'tile:fetching': CustomEvent<TileFetchingPayload>
  'tile:completed': CustomEvent<TileCompletedPayload>
  'tile:failed': CustomEvent<TileFailedPayload>
  'place:fetched': CustomEvent<PlaceFetchedPayload>
  'place:selected': CustomEvent<PlaceSelectedPayload>
  'stats:updated': CustomEvent<StatsUpdatedPayload>
  'error:occurred': CustomEvent<ErrorPayload>
}
