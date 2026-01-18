/**
 * Mapbox API response types
 */

export interface MapboxGeocodingResponse {
  type: 'FeatureCollection'
  features: MapboxGeocodingFeature[]
}

export interface MapboxGeocodingFeature {
  id: string
  type: 'Feature'
  place_type: string[]
  text: string
  place_name: string
  center: [number, number] // [lng, lat]
  bbox?: [number, number, number, number] // [west, south, east, north]
  geometry: {
    type: 'Point'
    coordinates: [number, number]
  }
  properties: Record<string, unknown>
}

export interface MapboxCategorySearchResponse {
  type: 'FeatureCollection'
  features: MapboxSearchFeature[]
}

export interface MapboxSearchFeature {
  type: 'Feature'
  id: string
  geometry: {
    type: 'Point'
    coordinates: [number, number]
  }
  properties: {
    mapbox_id: string
    name: string
    name_preferred?: string
    address?: string
    full_address?: string
    place_formatted?: string
    category?: string
    maki?: string
    poi_category?: string[]
    poi_category_ids?: string[]
    [key: string]: unknown
  }
}

export interface QueuedRequest<T> {
  id: string
  execute: () => Promise<T>
  resolve: (value: T) => void
  reject: (error: Error) => void
  retries: number
}
