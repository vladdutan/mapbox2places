/**
 * Application entry point
 * Renders layout and initializes the Mapbox map
 */

import './style.css'
import { initializeMap } from './map/map'
import { initializeRegionLayer } from './map/region-layer'
import { initializeRegionEditor } from './map/region-editor'
import { initializeMarkerLayer } from './map/marker-layer'
import { initializeTileLayer } from './map/tile-layer'
import { renderLayout, getMapContainer } from './ui/layout'
import { initializeSearch } from './ui/search'
import { initializeSearchResults } from './ui/search-results'
import { initializeStatsPanel } from './ui/stats-panel'
import { initializePlaceModal } from './ui/place-modal'
import { initializeTileFetcher } from './exploration/tile-fetcher'
import { initializePersistence, restoreFromStorage } from './storage/persistence'
import { handleError } from './utils/error-handler'
import { ErrorCategory } from './types/events.types'
import { renderApiKeyInput, shouldShowApiKeyInput } from './ui/api-key-input'
import { initializeGoogleMaps } from './api/providers/google-provider'

/**
 * Initialize the application
 */
async function init(): Promise<void> {
  const startTime = performance.now()

  // Get the app container
  const appContainer = document.getElementById('app')
  if (!appContainer) {
    throw new Error('App container not found')
  }

  // Render the application layout
  renderLayout(appContainer)

  // Initialize search functionality
  initializeSearch()
  initializeSearchResults()

  // Initialize place modal
  initializePlaceModal()

  // Get the map container from the rendered layout
  const mapContainer = getMapContainer()
  if (!mapContainer) {
    throw new Error('Map container not found after layout render')
  }

  // Check if API key is configured
  if (shouldShowApiKeyInput()) {
    // Show API key input form
    renderApiKeyInput(mapContainer, () => {
      // Re-initialize after token is entered
      initializeMapAndComponents(mapContainer, startTime)
    })
    return
  }

  // Initialize map and components
  await initializeMapAndComponents(mapContainer, startTime)
}

/**
 * Initialize map and dependent components
 */
async function initializeMapAndComponents(
  mapContainer: HTMLElement,
  startTime: number
): Promise<void> {
  try {
    // Initialize the Mapbox map
    await initializeMap(mapContainer)

    // Initialize map layers and UI components that depend on map
    initializeRegionLayer()
    initializeRegionEditor()
    initializeTileLayer()
    initializeMarkerLayer()
    initializeStatsPanel()
    initializeTileFetcher()
    
    // Auto-init Google Maps provided env var exists
    initializeGoogleMaps()

    // Initialize persistence (auto-save to IndexedDB)
    await initializePersistence()

    // Restore any previously saved data from IndexedDB
    await restoreFromStorage()

    const loadTime = performance.now() - startTime
    console.log(`App initialized in ${loadTime.toFixed(0)}ms`)

    // Log warning if load time exceeds NFR5 threshold
    if (loadTime > 3000) {
      console.warn(`App load time (${loadTime.toFixed(0)}ms) exceeded 3s target (NFR5)`)
    }
  } catch (error) {
    handleError(error, ErrorCategory.Unknown)

    // Show error state in map container
    if (mapContainer) {
      mapContainer.innerHTML = `
        <div class="flex items-center justify-center h-full bg-red-50">
          <div class="text-center p-8">
            <h2 class="text-xl font-semibold text-red-700 mb-2">Failed to load map</h2>
            <p class="text-red-600">${error instanceof Error ? error.message : 'Unknown error'}</p>
            <p class="text-sm text-gray-500 mt-4">Please enter a valid Mapbox API key or set VITE_MAPBOX_TOKEN in your .env file</p>
          </div>
        </div>
      `
    }
  }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init)
} else {
  init()
}
