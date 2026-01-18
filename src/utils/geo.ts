/**
 * Geospatial utility functions
 */

import type { Bounds, Coordinates } from '../types/exploration.types'

/** Earth's radius in meters */
const EARTH_RADIUS = 6371000

/**
 * Convert degrees to radians
 */
export function toRadians(degrees: number): number {
  return degrees * (Math.PI / 180)
}

/**
 * Convert radians to degrees
 */
export function toDegrees(radians: number): number {
  return radians * (180 / Math.PI)
}

/**
 * Calculate the distance between two coordinates using Haversine formula
 * @returns Distance in meters
 */
export function haversineDistance(coord1: Coordinates, coord2: Coordinates): number {
  const [lng1, lat1] = coord1
  const [lng2, lat2] = coord2

  const dLat = toRadians(lat2 - lat1)
  const dLng = toRadians(lng2 - lng1)

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2)

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))

  return EARTH_RADIUS * c
}

/**
 * Calculate bounds width in meters at given latitude
 */
export function boundsWidthMeters(bounds: Bounds): number {
  const [west, south, east, north] = bounds
  const midLat = (south + north) / 2
  return haversineDistance([west, midLat], [east, midLat])
}

/**
 * Calculate bounds height in meters
 */
export function boundsHeightMeters(bounds: Bounds): number {
  const [west, south, east, north] = bounds
  const midLng = (west + east) / 2
  return haversineDistance([midLng, south], [midLng, north])
}

/**
 * Calculate the center of bounds
 */
export function boundsCenter(bounds: Bounds): Coordinates {
  const [west, south, east, north] = bounds
  return [(west + east) / 2, (south + north) / 2]
}

/**
 * Check if a coordinate is within bounds
 */
export function isWithinBounds(coord: Coordinates, bounds: Bounds): boolean {
  const [lng, lat] = coord
  const [west, south, east, north] = bounds
  return lng >= west && lng <= east && lat >= south && lat <= north
}

/**
 * Convert meters to approximate degrees at given latitude
 * Note: This is an approximation, longitude degrees vary with latitude
 */
export function metersToDegrees(meters: number, latitude: number): { lng: number; lat: number } {
  const latDegrees = meters / 111320 // ~111.32km per degree latitude
  const lngDegrees = meters / (111320 * Math.cos(toRadians(latitude)))
  return { lng: lngDegrees, lat: latDegrees }
}
