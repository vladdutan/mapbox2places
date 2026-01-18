/**
 * Core domain types for map2places exploration
 */

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
  mapboxId: string
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
  placesFound: number
  requestsMade: number
  estimatedCost: number
}

/** [west, south, east, north] */
export type Bounds = [number, number, number, number]

/** [longitude, latitude] */
export type Coordinates = [number, number]
