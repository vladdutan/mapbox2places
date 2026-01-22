/**
 * Core domain types for map2places exploration
 */

import type { Provider, ProviderStatsMap } from './provider.types'

export interface Region {
  id: string
  name: string
  bounds: Bounds
  createdAt: string // ISO 8601
}

export interface Tile {
  id: string
  regionId: string
  bounds: Bounds
  status: TileStatus
  fetchedAt: string | null // ISO 8601
  providerStatus?: TileProviderStatus // Per-provider completion status
}

/**
 * Tracks which providers have completed fetching for a tile
 */
export interface TileProviderStatus {
  mapbox?: 'pending' | 'complete' | 'error'
  google?: 'pending' | 'complete' | 'error'
  foursquare?: 'pending' | 'complete' | 'error'
}

export enum TileStatus {
  Pending = 'pending',
  Fetching = 'fetching',
  Complete = 'complete',
  Failed = 'failed'
}

export interface Place {
  id: string
  tileId: string
  regionId: string
  provider: Provider      // Which provider this POI came from
  providerId: string      // Provider-specific ID (was mapboxId)
  name: string
  category: string
  coordinates: Coordinates
  metadata: PlaceMetadata
}

export interface PlaceMetadata {
  address?: string
  fullAddress?: string
  placeFormatted?: string
  icon?: string
  [key: string]: unknown
}

export interface Exploration {
  id: string
  regionId: string
  categories: string[] // POI categories to search
  tileSize: number // meters
  enabledProviders: Provider[] // Which providers to use for this exploration
  status: ExplorationStatus
  stats: ExplorationStats
  startedAt: string // ISO 8601
  completedAt: string | null // ISO 8601
}

export enum ExplorationStatus {
  Idle = 'idle',
  Running = 'running',
  Paused = 'paused',
  Completed = 'completed',
  Error = 'error'
}

export interface ExplorationStats {
  tilesTotal: number
  tilesCompleted: number
  tilesFailed: number
  // Aggregate totals
  placesFound: number
  requestsMade: number
  estimatedCost: number
  // Per-provider breakdown
  providerStats: ProviderStatsMap
}

/** [west, south, east, north] */
export type Bounds = [number, number, number, number]

/** [longitude, latitude] */
export type Coordinates = [number, number]
