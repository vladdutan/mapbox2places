/**
 * POI marker visualization on the map
 * Renders POI markers as circles with clustering support
 */

import type { GeoJSONSource } from 'mapbox-gl'
import type { Place } from '../types/exploration.types'
import type { PlaceFetchedPayload, PlaceSelectedPayload } from '../types/events.types'
import { Provider, PROVIDER_COLORS } from '../types/provider.types'
import { getMap } from './map'
import { getPlaces, getCurrentExploration } from '../state/store'

const POI_SOURCE_ID = 'poi-markers'
const POI_LAYER_ID = 'poi-circles'
const CLUSTER_LAYER_ID = 'poi-clusters'
const CLUSTER_COUNT_LAYER_ID = 'poi-cluster-count'

// Individual marker styling
const CIRCLE_COLOR = '#ef4444' // red-500
const CIRCLE_RADIUS = 6
const CIRCLE_STROKE_COLOR = '#ffffff'
const CIRCLE_STROKE_WIDTH = 2

// Cluster styling
const CLUSTER_COLOR = '#3b82f6' // blue-500
const CLUSTER_STROKE_COLOR = '#ffffff'
const CLUSTER_STROKE_WIDTH = 2

// Clustering configuration
const CLUSTER_RADIUS = 50 // Pixels
const CLUSTER_MAX_ZOOM = 14 // Clusters break apart at this zoom

// Track all places for the current region
let currentRegionId: string | null = null

/**
 * Initialize POI marker layer on the map
 * Sets up source and layer for POI visualization
 */
export function initializeMarkerLayer(): void {
  const map = getMap()
  if (!map) {
    console.warn('Map not ready for marker layer initialization')
    return
  }

  // Add empty GeoJSON source with clustering enabled
  if (!map.getSource(POI_SOURCE_ID)) {
    map.addSource(POI_SOURCE_ID, {
      type: 'geojson',
      data: createEmptyFeatureCollection(),
      cluster: true,
      clusterRadius: CLUSTER_RADIUS,
      clusterMaxZoom: CLUSTER_MAX_ZOOM
    })
  }

  // Add cluster circle layer (rendered for clustered points)
  if (!map.getLayer(CLUSTER_LAYER_ID)) {
    map.addLayer({
      id: CLUSTER_LAYER_ID,
      type: 'circle',
      source: POI_SOURCE_ID,
      filter: ['has', 'point_count'],
      paint: {
        // Scale circle radius based on point count
        'circle-radius': [
          'step',
          ['get', 'point_count'],
          15,   // 15px for count < 10
          10, 20,  // 20px for count >= 10
          50, 25,  // 25px for count >= 50
          100, 30  // 30px for count >= 100
        ],
        'circle-color': CLUSTER_COLOR,
        'circle-stroke-color': CLUSTER_STROKE_COLOR,
        'circle-stroke-width': CLUSTER_STROKE_WIDTH
      }
    })
  }

  // Add cluster count label layer
  if (!map.getLayer(CLUSTER_COUNT_LAYER_ID)) {
    map.addLayer({
      id: CLUSTER_COUNT_LAYER_ID,
      type: 'symbol',
      source: POI_SOURCE_ID,
      filter: ['has', 'point_count'],
      layout: {
        'text-field': ['get', 'point_count_abbreviated'],
        'text-font': ['DIN Pro Medium', 'Arial Unicode MS Bold'],
        'text-size': 12
      },
      paint: {
        'text-color': '#ffffff'
      }
    })
  }

  // Add circle layer for individual POI markers (unclustered points)
  if (!map.getLayer(POI_LAYER_ID)) {
    map.addLayer({
      id: POI_LAYER_ID,
      type: 'circle',
      source: POI_SOURCE_ID,
      filter: ['!', ['has', 'point_count']],
      paint: {
        'circle-radius': CIRCLE_RADIUS,
        'circle-color': [
          'match',
          ['get', 'provider'],
          Provider.Mapbox, PROVIDER_COLORS[Provider.Mapbox],
          Provider.Google, PROVIDER_COLORS[Provider.Google],
          CIRCLE_COLOR // default fallback
        ],
        'circle-stroke-color': CIRCLE_STROKE_COLOR,
        'circle-stroke-width': CIRCLE_STROKE_WIDTH
      }
    })
  }

  // Ensure marker layers are on top of region layers
  if (map.getLayer('region-fill')) {
    map.moveLayer(CLUSTER_LAYER_ID)
    map.moveLayer(CLUSTER_COUNT_LAYER_ID)
    map.moveLayer(POI_LAYER_ID)
  }

  // Handle cluster click to zoom in
  map.on('click', CLUSTER_LAYER_ID, (e) => {
    const features = map.queryRenderedFeatures(e.point, {
      layers: [CLUSTER_LAYER_ID]
    })
    if (!features.length) return

    const clusterId = features[0].properties?.cluster_id
    if (clusterId === undefined) return

    const source = map.getSource(POI_SOURCE_ID) as GeoJSONSource
    source.getClusterExpansionZoom(clusterId, (err, zoom) => {
      if (err) return

      const geometry = features[0].geometry
      if (geometry.type !== 'Point') return

      map.easeTo({
        center: geometry.coordinates as [number, number],
        zoom: zoom ?? CLUSTER_MAX_ZOOM
      })
    })
  })

  // Change cursor on cluster hover
  map.on('mouseenter', CLUSTER_LAYER_ID, () => {
    map.getCanvas().style.cursor = 'pointer'
  })
  map.on('mouseleave', CLUSTER_LAYER_ID, () => {
    map.getCanvas().style.cursor = ''
  })

  // Handle individual marker click to select place
  map.on('click', POI_LAYER_ID, (e) => {
    const features = map.queryRenderedFeatures(e.point, {
      layers: [POI_LAYER_ID]
    })
    if (!features.length) return

    const feature = features[0]
    const properties = feature.properties
    if (!properties) return

    const geometry = feature.geometry
    if (geometry.type !== 'Point') return

    // Reconstruct Place object from feature properties
    const place: Place = {
      id: properties.id,
      tileId: '', // Not stored in feature, not needed for modal
      regionId: '', // Not stored in feature, not needed for modal
      provider: (properties.provider || Provider.Mapbox) as Provider,
      providerId: properties.providerId,
      name: properties.name,
      category: properties.category,
      coordinates: geometry.coordinates as [number, number],
      metadata: {
        address: properties.address || undefined,
        fullAddress: properties.fullAddress || undefined
      }
    }

    // Dispatch place:selected event
    window.dispatchEvent(new CustomEvent<PlaceSelectedPayload>('place:selected', {
      detail: { place }
    }))
  })

  // Change cursor on individual marker hover
  map.on('mouseenter', POI_LAYER_ID, () => {
    map.getCanvas().style.cursor = 'pointer'
  })
  map.on('mouseleave', POI_LAYER_ID, () => {
    map.getCanvas().style.cursor = ''
  })

  // Listen for place:fetched events to add new markers
  window.addEventListener('place:fetched', ((e: CustomEvent<PlaceFetchedPayload>) => {
    addPlacesToMap(e.detail.places)
  }) as EventListener)

  // Listen for region changes to show correct markers
  window.addEventListener('state:changed', ((e: CustomEvent<{ type: string }>) => {
    if (e.detail.type === 'region' || e.detail.type === 'exploration') {
      updateMarkersForCurrentRegion()
    }
  }) as EventListener)
}

/**
 * Add places to the map as markers
 * @param places - Array of places to add
 */
function addPlacesToMap(places: Place[]): void {
  if (places.length === 0) return

  const map = getMap()
  if (!map) return

  const source = map.getSource(POI_SOURCE_ID) as GeoJSONSource | undefined
  if (!source) {
    console.warn('POI source not found')
    return
  }

  // Get the region ID from the first place
  const regionId = places[0].regionId

  // If this is for the current region, update markers
  const exploration = getCurrentExploration()
  if (exploration && exploration.regionId === regionId) {
    currentRegionId = regionId
    const allPlaces = getPlaces(regionId)
    source.setData(placesToFeatureCollection(allPlaces))

    // Ensure marker layers are on top of region layers
    ensureMarkersOnTop()
  }
}

/**
 * Update markers to show places for the current region
 */
function updateMarkersForCurrentRegion(): void {
  const map = getMap()
  if (!map) return

  const source = map.getSource(POI_SOURCE_ID) as GeoJSONSource | undefined
  if (!source) return

  const exploration = getCurrentExploration()
  if (!exploration) {
    // Clear markers if no exploration
    currentRegionId = null
    source.setData(createEmptyFeatureCollection())
    return
  }

  // Only update if region changed
  if (currentRegionId !== exploration.regionId) {
    currentRegionId = exploration.regionId
    const places = getPlaces(exploration.regionId)
    source.setData(placesToFeatureCollection(places))

    // Ensure marker layers are on top of region layers
    ensureMarkersOnTop()
  }
}

/**
 * Move marker layers above region and tile layers
 */
function ensureMarkersOnTop(): void {
  const map = getMap()
  if (!map) return

  // Move marker layers to the very top (above region and tile layers)
  if (map.getLayer(CLUSTER_LAYER_ID)) {
    map.moveLayer(CLUSTER_LAYER_ID)
    map.moveLayer(CLUSTER_COUNT_LAYER_ID)
    map.moveLayer(POI_LAYER_ID)
  }
}

/**
 * Public method to ensure markers stay on top after other layers are added/modified
 */
export function bringMarkersToFront(): void {
  ensureMarkersOnTop()
}

/**
 * Convert places to a GeoJSON FeatureCollection
 * @param places - Array of places to convert
 */
function placesToFeatureCollection(places: Place[]): GeoJSON.FeatureCollection<GeoJSON.Point> {
  return {
    type: 'FeatureCollection',
    features: places.map(place => ({
      type: 'Feature' as const,
      properties: {
        id: place.id,
        provider: place.provider,
        providerId: place.providerId,
        name: place.name,
        category: place.category,
        address: place.metadata.address || '',
        fullAddress: place.metadata.fullAddress || ''
      },
      geometry: {
        type: 'Point' as const,
        coordinates: place.coordinates
      }
    }))
  }
}

/**
 * Create an empty GeoJSON FeatureCollection
 */
function createEmptyFeatureCollection(): GeoJSON.FeatureCollection {
  return {
    type: 'FeatureCollection',
    features: []
  }
}

/**
 * Clear all markers from the map
 */
export function clearMarkers(): void {
  const map = getMap()
  if (!map) return

  const source = map.getSource(POI_SOURCE_ID) as GeoJSONSource | undefined
  if (source) {
    currentRegionId = null
    source.setData(createEmptyFeatureCollection())
  }
}

/**
 * Filter displayed markers by provider
 * @param visibleProviders - Array of providers to show
 */
export function setMarkerProviderVisibility(visibleProviders: Provider[]): void {
  const map = getMap()
  if (!map) return

  // Filter individual markers
  if (map.getLayer(POI_LAYER_ID)) {
    const filter = [
      'all',
      ['!', ['has', 'point_count']],
      ['in', ['get', 'provider'], ['literal', visibleProviders]]
    ]
    map.setFilter(POI_LAYER_ID, filter)
  }

  // Filter clusters (this is tricker as clusters are pre-calculated)
  // For now, clusters will show all points, but individual points filter works.
  // Ideally, we'd filter the DATA itself, but that's expensive for client-side clustering.
  // Mapbox GL JS doesn't support filtering inside clusters easily without reloading source.
  // Given the constraint, we'll just filter visible markers.
}
