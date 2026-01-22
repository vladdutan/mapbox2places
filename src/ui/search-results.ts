/**
 * Search results display and selection handling
 * Renders geocoding results and handles region selection
 */

import type { MapboxGeocodingFeature } from '../types/api.types'
import type { Region, Bounds } from '../types/exploration.types'
import { renderSearchResults, showSearchResults, getSearchInput } from './layout'
import { fitBounds, flyTo } from '../map/map'
import { setPendingRegion, setCurrentRegion } from '../state/store'
import type { SearchCompletedPayload } from './search'

/**
 * Region selected event payload
 */
export interface RegionSelectedPayload {
  region: Region
  feature: MapboxGeocodingFeature
}

/**
 * Initialize search results handling
 * Sets up event listeners for search completion
 */
export function initializeSearchResults(): void {
  // Listen for search completed events
  window.addEventListener('search:completed', ((e: CustomEvent<SearchCompletedPayload>) => {
    const { results } = e.detail
    displayResults(results)
  }) as EventListener)

  // Close results when clicking outside
  document.addEventListener('click', (e) => {
    const target = e.target as HTMLElement
    const searchContainer = document.getElementById('search-container')
    if (searchContainer && !searchContainer.contains(target)) {
      showSearchResults(false)
    }
  })

  // Close results on Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      showSearchResults(false)
    }
  })
}

/**
 * Display search results in the dropdown
 * @param results - Array of geocoding features
 */
function displayResults(results: MapboxGeocodingFeature[]): void {
  if (results.length === 0) {
    renderSearchResults('')
    return
  }

  const html = results.map((feature, index) => {
    const placeName = feature.place_name
    const placeType = getPlaceTypeLabel(feature.place_type[0])
    const typeColor = getPlaceTypeColor(feature.place_type[0])

    return `
      <button
        type="button"
        class="w-full px-4 py-3 text-left hover:bg-gray-50 focus:bg-gray-50 focus:outline-none border-b border-gray-100 last:border-b-0 transition-colors"
        data-result-index="${index}"
      >
        <div class="flex items-start justify-between gap-2">
          <span class="text-sm text-gray-800 leading-snug">${escapeHtml(placeName)}</span>
          <span class="flex-shrink-0 text-xs px-2 py-0.5 rounded-full ${typeColor}">${placeType}</span>
        </div>
      </button>
    `
  }).join('')

  renderSearchResults(html)

  // Add click handlers to results
  const resultsContainer = document.getElementById('search-results')
  if (resultsContainer) {
    resultsContainer.querySelectorAll('button[data-result-index]').forEach((button) => {
      button.addEventListener('click', () => {
        const index = parseInt(button.getAttribute('data-result-index') || '0', 10)
        selectResult(results[index])
      })
    })
  }
}

/**
 * Handle selection of a search result
 * @param feature - The selected geocoding feature
 */
function selectResult(feature: MapboxGeocodingFeature): void {
  // Create bounds from bbox or center
  const bounds = getBoundsFromFeature(feature)

  // Create region record
  const region: Region = {
    id: crypto.randomUUID(),
    name: feature.place_name,
    bounds,
    createdAt: new Date().toISOString()
  }

  // Set as pending region (not saved to history yet)
  setPendingRegion(region)
  setCurrentRegion(region.id)

  // Zoom map to region
  if (feature.bbox) {
    fitBounds(feature.bbox as [number, number, number, number])
  } else {
    // No bbox, fly to center with appropriate zoom
    const zoom = getZoomForPlaceType(feature.place_type[0])
    flyTo(feature.center, zoom)
  }

  // Clear search input and close results
  const input = getSearchInput()
  if (input) {
    input.value = ''
  }
  showSearchResults(false)

  // Dispatch region selected event
  window.dispatchEvent(new CustomEvent<RegionSelectedPayload>('region:selected', {
    detail: { region, feature }
  }))
}

/**
 * Get bounds from a geocoding feature
 * Uses bbox if available, otherwise creates a box around the center
 */
function getBoundsFromFeature(feature: MapboxGeocodingFeature): Bounds {
  if (feature.bbox) {
    return feature.bbox as Bounds
  }

  // Create approximate bounds from center
  const [lng, lat] = feature.center
  const offset = getOffsetForPlaceType(feature.place_type[0])

  return [
    lng - offset,
    lat - offset,
    lng + offset,
    lat + offset
  ]
}

/**
 * Get appropriate zoom level for a place type
 */
function getZoomForPlaceType(placeType: string): number {
  switch (placeType) {
    case 'country':
      return 5
    case 'region':
      return 7
    case 'place':
      return 10
    case 'district':
    case 'locality':
      return 12
    default:
      return 10
  }
}

/**
 * Get approximate offset (in degrees) for creating bounds from center
 */
function getOffsetForPlaceType(placeType: string): number {
  switch (placeType) {
    case 'country':
      return 5
    case 'region':
      return 2
    case 'place':
      return 0.1
    case 'district':
    case 'locality':
      return 0.05
    default:
      return 0.1
  }
}

/**
 * Get human-readable label for a place type
 */
function getPlaceTypeLabel(placeType: string): string {
  switch (placeType) {
    case 'country':
      return 'Country'
    case 'region':
      return 'Region'
    case 'place':
      return 'City'
    case 'district':
      return 'District'
    case 'locality':
      return 'Locality'
    default:
      return 'Place'
  }
}

/**
 * Get Tailwind color classes for a place type badge
 */
function getPlaceTypeColor(placeType: string): string {
  switch (placeType) {
    case 'country':
      return 'bg-purple-100 text-purple-700'
    case 'region':
      return 'bg-blue-100 text-blue-700'
    case 'place':
      return 'bg-green-100 text-green-700'
    case 'district':
      return 'bg-orange-100 text-orange-700'
    case 'locality':
      return 'bg-yellow-100 text-yellow-700'
    default:
      return 'bg-gray-100 text-gray-700'
  }
}

/**
 * Escape HTML to prevent XSS
 */
function escapeHtml(text: string): string {
  const div = document.createElement('div')
  div.textContent = text
  return div.innerHTML
}
