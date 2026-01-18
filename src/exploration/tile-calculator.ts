/**
 * Tile grid calculation for region exploration
 */

import type { Bounds, Tile } from '../types/exploration.types'
import { TileStatus } from '../types/exploration.types'
import { metersToDegrees } from '../utils/geo'

/**
 * Calculate tile grid for a region
 * @param bounds Region bounds [west, south, east, north]
 * @param tileSizeMeters Tile size in meters (default 500m)
 * @param regionId Region ID for tile association
 * @returns Array of tiles covering the region
 */
export function calculateTileGrid(
  bounds: Bounds,
  tileSizeMeters: number = 500,
  regionId: string
): Tile[] {
  const [west, south, east, north] = bounds
  const tiles: Tile[] = []

  // Calculate degrees per tile at the center latitude
  const centerLat = (south + north) / 2
  const { lng: lngStep, lat: latStep } = metersToDegrees(tileSizeMeters, centerLat)

  // Generate tile grid
  let currentLat = south
  while (currentLat < north) {
    let currentLng = west
    while (currentLng < east) {
      const tileBounds: Bounds = [
        currentLng,
        currentLat,
        Math.min(currentLng + lngStep, east),
        Math.min(currentLat + latStep, north)
      ]

      tiles.push({
        id: crypto.randomUUID(),
        regionId,
        bounds: tileBounds,
        status: TileStatus.Pending,
        fetchedAt: null
      })

      currentLng += lngStep
    }
    currentLat += latStep
  }

  return tiles
}

/**
 * Estimate tile count for a region without generating tiles
 */
export function estimateTileCount(bounds: Bounds, tileSizeMeters: number = 500): number {
  const [west, south, east, north] = bounds
  const centerLat = (south + north) / 2
  const { lng: lngStep, lat: latStep } = metersToDegrees(tileSizeMeters, centerLat)

  const lngCount = Math.ceil((east - west) / lngStep)
  const latCount = Math.ceil((north - south) / latStep)

  return lngCount * latCount
}

/**
 * Get tile center coordinates for API request
 */
export function getTileCenter(tile: Tile): [number, number] {
  const [west, south, east, north] = tile.bounds
  return [(west + east) / 2, (south + north) / 2]
}
