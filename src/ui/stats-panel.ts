/**
 * Stats panel UI management
 * Displays region list, current region info, and exploration statistics
 */

import { updateStatsContent } from './layout'
import { getCurrentRegion, getRegions, setCurrentRegion, removeRegion, getTileSize, setTileSize, TILE_SIZE_OPTIONS, getSelectedCategories, addCategory, removeCategory, POI_CATEGORIES, getCurrentExploration, getExplorationByRegion, setCurrentExploration, getAllExplorations, getSelectedProviders, toggleSelectedProvider } from '../state/store'
import { setOverlayVisibility, getOverlayVisibility } from '../map/tile-layer'
import { fitBounds, flyTo } from '../map/map'
import { estimateTileCount } from '../exploration/tile-calculator'
import { startExploration } from '../exploration/exploration-manager'
import type { Region } from '../types/exploration.types'
import { ExplorationStatus } from '../types/exploration.types'
import { Provider, PROVIDER_NAMES, PROVIDER_COLORS } from '../types/provider.types'
import { setMarkerProviderVisibility } from '../map/marker-layer'
import { isProviderAvailable } from '../api/providers'


/**
 * Initialize stats panel updates
 * Sets up event listeners for region and exploration changes
 */
export function initializeStatsPanel(): void {
  // Listen for state changes
  window.addEventListener('state:changed', ((e: CustomEvent<{ type: string }>) => {
    if (e.detail.type === 'region' || e.detail.type === 'config' || e.detail.type === 'exploration' || e.detail.type === 'tile') {
      renderStatsPanel()
      renderNavbarRegions() // Update navbar regions
    }
  }) as EventListener)

  // Initial render
  renderStatsPanel()
  renderNavbarRegions()
}

/**
 * Render the complete stats panel
 */
function renderStatsPanel(): void {
  const regions = getRegions()
  const currentRegion = getCurrentRegion()

  // Only show empty state if no regions AND no current (pending) region
  if (regions.length === 0 && !currentRegion) {
    renderEmptyState()
    return
  }

  const currentExploration = getCurrentExploration()
  const isExplorationCompleted = currentExploration?.status === ExplorationStatus.Completed
  const isExplorationRunning = currentExploration?.status === ExplorationStatus.Running

  // Determine which stage to show
  let html = ''
  
  if (isExplorationCompleted) {
    // RESULTS STAGE: Show completed exploration results
    html = `
      ${renderExplorationResults(currentRegion!, currentExploration!)}
      ${renderMapControls()}
      ${renderQuickStats()}
    `
  } else if (isExplorationRunning) {
    // RUNNING STAGE: Show exploration in progress
    html = renderExplorationStatus(currentRegion!, currentExploration!)
  } else {
    // CONFIGURATION STAGE: Show configuration options for new/uncompleted regions
    html = renderConfigurationStage(currentRegion!)
  }

  updateStatsContent(html)
  attachTileSizeListener()
  attachCategoryListener()
  attachProviderSelectListener()

  attachStartExplorationListener()
  attachMapControlsListener()
}

/**
 * Render regions in the navbar history container
 */
function renderNavbarRegions(): void {
  const navbarContainer = document.getElementById('regions-history')
  if (!navbarContainer) return

  const regions = getRegions()
  const currentRegion = getCurrentRegion()
  const allExplorations = getAllExplorations()

  // Filter regions to only those with explorations
  const regionsWithExplorations = regions.filter(region => {
    const exploration = allExplorations.find(exp => exp.regionId === region.id)
    return exploration !== undefined
  })

  if (regionsWithExplorations.length === 0) {
    navbarContainer.innerHTML = '<span class="text-sm text-gray-400">No explorations</span>'
    return
  }

  const items: string[] = []
  
  // Only show regions that have explorations
  items.push(...regionsWithExplorations.map(region => 
    renderNavbarRegionItem(region, region.id === currentRegion?.id, false)
  ))

  navbarContainer.innerHTML = items.join('')

  // Attach event listeners for navbar regions
  attachNavbarRegionListeners()
}

/**
 * Render a single region as a compact chip for the navbar
 */
function renderNavbarRegionItem(region: Region, isSelected: boolean, isPending: boolean = false): string {
  const bgClass = isSelected ? 'bg-blue-600' : (isPending ? 'bg-yellow-100 border-yellow-300 border-dashed' : 'bg-gray-200 hover:bg-gray-300')
  const textClass = isSelected ? 'text-white' : (isPending ? 'text-yellow-800 font-semibold' : 'text-gray-700')
  const removeClass = isSelected ? 'text-blue-200 hover:text-white' : (isPending ? 'text-yellow-600 hover:text-yellow-800' : 'text-gray-500 hover:text-gray-700')

  // Use 'New Exploration' for pending, otherwise short name
  const displayName = isPending ? 'New Exploration' : region.name.split(',')[0].trim()
  const titleName = region.name

  return `
    <div class="flex items-center gap-1.5 ${bgClass} rounded-full px-3 py-1.5 transition-colors flex-shrink-0 ${isPending ? 'border' : ''}" data-navbar-region-id="${region.id}">
      <button
        type="button"
        class="text-sm ${textClass} truncate max-w-[120px] navbar-region-select-btn"
        title="${escapeHtml(titleName)}"
      >
        ${escapeHtml(displayName)}
      </button>
      ${!isPending ? `
      <button
        type="button"
        class="${removeClass} hover:bg-black/10 rounded-full p-0.5 transition-colors navbar-region-remove-btn"
        title="Remove region"
        data-region-id="${region.id}"
      >
        <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2.5">
          <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
      ` : ''}
    </div>
  `
}

/**
 * Format tile size for display
 */
function formatTileSize(size: number): string {
  if (size >= 1000) {
    return `${size / 1000}km`
  }
  return `${size}m`
}

/**
 * Render exploration results when completed
 */
function renderExplorationResults(region: Region, exploration: import('../types/exploration.types').Exploration): string {
  const { stats } = exploration
  const categoryLabels = exploration.categories.map(catId => {
    const cat = POI_CATEGORIES.find(c => c.id === catId)
    return cat ? cat.label : catId
  })

  return `
    <!-- Current Region Details -->
    <div class="mb-6">
      <h3 class="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">Selected Region</h3>
      <div class="bg-blue-50 border border-blue-200 rounded-lg p-3">
        <p class="text-sm font-medium text-blue-800 leading-snug">${escapeHtml(region.name)}</p>
      </div>
    </div>

    <!-- Exploration Complete -->
    <div class="mb-6">
      <h3 class="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">Exploration Complete</h3>
      <div class="bg-blue-50 border border-blue-200 rounded-lg p-3 space-y-3">
        <!-- Categories -->
        <div>
          <span class="text-sm text-gray-600 block mb-1">Categories</span>
          <div class="flex flex-wrap gap-1">
            ${categoryLabels.map(label => `
              <span class="px-2 py-0.5 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">${label}</span>
            `).join('')}
          </div>
        </div>

        <!-- Tile Size -->
        <div class="flex items-center justify-between">
          <span class="text-sm text-gray-600">Tile Size</span>
          <span class="text-sm font-medium text-gray-800">${formatTileSize(exploration.tileSize)} × ${formatTileSize(exploration.tileSize)}</span>
        </div>

        <!-- Stats -->
        <div class="flex items-center justify-between">
          <span class="text-sm text-gray-600">Places Found</span>
          <span class="text-sm font-medium text-gray-800">${stats.placesFound.toLocaleString()}</span>
        </div>

        <div class="flex items-center justify-between">
          <span class="text-sm text-gray-600">Total Tiles</span>
          <span class="text-sm font-medium text-gray-800">${stats.tilesTotal.toLocaleString()}</span>
        </div>

        ${stats.tilesFailed > 0 ? `
        <div class="flex items-center justify-between">
          <span class="text-sm text-gray-600">Tiles Failed</span>
          <span class="text-sm font-medium text-red-600">${stats.tilesFailed.toLocaleString()}</span>
        </div>
        ` : ''}

        <div class="flex items-center justify-between">
          <span class="text-sm text-gray-600">API Requests</span>
          <span class="text-sm font-medium text-gray-800">${stats.requestsMade.toLocaleString()}</span>
        </div>

        <div class="flex items-center justify-between">
          <span class="text-sm text-gray-600 flex items-center gap-1">
            Est. Cost
            <a href="https://www.mapbox.com/pricing" target="_blank" rel="noopener" title="Mapbox Pricing - $1.70 per 1000 requests" class="text-gray-400 hover:text-blue-500">
              <svg class="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd" />
              </svg>
            </a>
          </span>
          <span class="text-sm font-medium text-gray-800" title="${stats.requestsMade.toLocaleString()} requests">${stats.estimatedCost.toFixed(2)}</span>
        </div>

        ${renderProviderStatsBreakdown(stats.providerStats)}
      </div>
    </div>
  `
}

/**
 * Render configuration stage for new or uncompleted regions
 * Shows full configuration options: providers, categories, tile size
 */
function renderConfigurationStage(region: Region): string {
  const tileSize = getTileSize()
  const tileCount = estimateTileCount(region.bounds, tileSize)
  const selectedCategories = getSelectedCategories()
  const selectedProviders = getSelectedProviders()

  // Get available categories (not yet selected)
  const availableCategories = POI_CATEGORIES.filter(cat => !selectedCategories.includes(cat.id))

  return `
    <!-- Current Region Details -->
    <div class="mb-6">
      <h3 class="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">Selected Region</h3>
      <div class="bg-blue-50 border border-blue-200 rounded-lg p-3">
        <p class="text-sm font-medium text-blue-800 leading-snug">${escapeHtml(region.name)}</p>
      </div>
    </div>

    <!-- Exploration Configuration -->
    <div class="mb-6">
      <h3 class="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">Configuration</h3>
      <div class="bg-gray-50 border border-gray-200 rounded-lg p-3 space-y-3">
        <!-- Providers Selection -->
        <div>
          <span class="text-sm text-gray-600 block mb-2">Active Providers</span>
          <div class="space-y-1.5 bg-white border border-gray-200 rounded p-2">
            ${Object.values(Provider).map(provider => {
              const isSelected = selectedProviders.includes(provider)
              const available = isProviderAvailable(provider)
              const name = PROVIDER_NAMES[provider]
              
              return `
                <label class="flex items-center gap-2 cursor-pointer ${!available ? 'opacity-50 cursor-not-allowed' : ''}">
                  <input type="checkbox" 
                    class="provider-select-toggle w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                    value="${provider}"
                    ${isSelected ? 'checked' : ''}
                    ${!available ? 'disabled' : ''}
                  >
                  <span class="text-sm text-gray-700">${name}</span>
                </label>
              `
            }).join('')}
          </div>
          </div>
          
          </div>

        <!-- POI Categories -->
        <div>
          <span class="text-sm text-gray-600 block mb-2">Categories</span>

          <!-- Selected category tags -->
          <div id="category-tags" class="flex flex-wrap gap-1.5 mb-2">
            ${selectedCategories.map(catId => {
              const cat = POI_CATEGORIES.find(c => c.id === catId)
              return cat ? `
                <span class="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full" data-category="${cat.id}">
                  ${cat.label}
                  <button type="button" class="category-remove-btn hover:text-blue-600" data-category="${cat.id}">
                    <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </span>
              ` : ''
            }).join('')}
          </div>

          <!-- Add category dropdown -->
          ${availableCategories.length > 0 ? `
            <select
              id="category-add-select"
              class="w-full text-sm text-gray-600 bg-white border border-gray-300 rounded px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">+ Add category...</option>
              ${availableCategories.map(cat => `
                <option value="${cat.id}">${cat.label}</option>
              `).join('')}
            </select>
          ` : `
            <p class="text-xs text-gray-400">All categories selected</p>
          `}
        </div>

        <!-- Tile Size -->
        <div class="flex items-center justify-between">
          <span class="text-sm text-gray-600">Tile Size</span>
          <select
            id="tile-size-select"
            class="text-sm font-medium text-gray-800 bg-white border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            ${TILE_SIZE_OPTIONS.map(size => `
              <option value="${size}" ${size === tileSize ? 'selected' : ''}>
                ${formatTileSize(size)} × ${formatTileSize(size)}
              </option>
            `).join('')}
          </select>
        </div>

        <!-- Estimated Tiles -->
        <div class="flex items-center justify-between">
          <span class="text-sm text-gray-600">Est. Tiles</span>
          <span class="text-sm font-medium text-gray-800">${tileCount.toLocaleString()}</span>
        </div>
      </div>
    </div>

    <!-- Start Exploration Button -->
    <div class="mb-6">
      <button
        id="start-exploration-btn"
        type="button"
        class="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
        ${selectedCategories.length === 0 ? 'disabled' : ''}
      >
        Start Exploration
      </button>
      ${selectedCategories.length === 0 ? '<p class="text-xs text-red-500 mt-1 text-center">Select at least one category</p>' : ''}
    </div>
  `
}

/**
 * Render exploration status when running
 */
function renderExplorationStatus(region: Region, exploration: import('../types/exploration.types').Exploration): string {
  const { stats } = exploration
  const progress = stats.tilesTotal > 0 ? Math.round((stats.tilesCompleted / stats.tilesTotal) * 100) : 0
  const categoryLabels = exploration.categories.map(catId => {
    const cat = POI_CATEGORIES.find(c => c.id === catId)
    return cat ? cat.label : catId
  })

  return `
    <!-- Current Region Details -->
    <div class="mb-6">
      <h3 class="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">Selected Region</h3>
      <div class="bg-blue-50 border border-blue-200 rounded-lg p-3">
        <p class="text-sm font-medium text-blue-800 leading-snug">${escapeHtml(region.name)}</p>
      </div>
    </div>

    <!-- Exploration In Progress -->
    <div class="mb-6">
      <h3 class="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">Exploration Running</h3>
      <div class="bg-green-50 border border-green-200 rounded-lg p-3 space-y-3">
        <!-- Categories -->
        <div>
          <span class="text-sm text-gray-600 block mb-1">Categories</span>
          <div class="flex flex-wrap gap-1">
            ${categoryLabels.map(label => `
              <span class="px-2 py-0.5 bg-green-100 text-green-800 text-xs font-medium rounded-full">${label}</span>
            `).join('')}
          </div>
        </div>

        <!-- Tile Size -->
        <div class="flex items-center justify-between">
          <span class="text-sm text-gray-600">Tile Size</span>
          <span class="text-sm font-medium text-gray-800">${formatTileSize(exploration.tileSize)} × ${formatTileSize(exploration.tileSize)}</span>
        </div>

        <!-- Progress Bar -->
        <div>
          <div class="flex items-center justify-between mb-1">
            <span class="text-sm text-gray-600">Progress</span>
            <span class="text-sm font-medium text-gray-800">${stats.tilesCompleted} / ${stats.tilesTotal} tiles</span>
          </div>
          <div class="w-full bg-gray-200 rounded-full h-2">
            <div class="bg-green-500 h-2 rounded-full transition-all" style="width: ${progress}%"></div>
          </div>
        </div>

        <!-- Stats -->
        <div class="flex items-center justify-between">
          <span class="text-sm text-gray-600">Places Found</span>
          <span class="text-sm font-medium text-gray-800">${stats.placesFound.toLocaleString()}</span>
        </div>

        ${stats.tilesFailed > 0 ? `
        <div class="flex items-center justify-between">
          <span class="text-sm text-gray-600">Tiles Failed</span>
          <span class="text-sm font-medium text-red-600">${stats.tilesFailed.toLocaleString()}</span>
        </div>
        ` : ''}

        <div class="flex items-center justify-between">
          <span class="text-sm text-gray-600">API Requests</span>
          <span class="text-sm font-medium text-gray-800">${stats.requestsMade.toLocaleString()}</span>
        </div>

        <div class="flex items-center justify-between">
          <span class="text-sm text-gray-600 flex items-center gap-1">
            Est. Cost
            <a href="https://www.mapbox.com/pricing" target="_blank" rel="noopener" title="Mapbox Pricing - $1.70 per 1000 requests" class="text-gray-400 hover:text-blue-500">
              <svg class="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd" />
              </svg>
            </a>
          </span>
          <span class="text-sm font-medium text-gray-800" title="${stats.requestsMade.toLocaleString()} requests">${stats.estimatedCost.toFixed(2)}</span>
        </div>

        ${renderProviderStatsBreakdown(stats.providerStats)}
      </div>
    </div>
  `
}

/**
 * Render per-provider stats breakdown
 */
function renderProviderStatsBreakdown(providerStats: import('../types/provider.types').ProviderStatsMap | undefined): string {
  if (!providerStats) return ''

  // Get providers that have data
  const activeProviders = Object.entries(providerStats).filter(
    ([_, stats]) => stats && (stats.requestsMade > 0 || stats.placesFound > 0)
  )

  if (activeProviders.length === 0) return ''

  return `
    <!-- Provider Breakdown -->
    <div class="border-t border-green-200 pt-3 mt-3">
      <span class="text-xs font-medium text-gray-500 uppercase tracking-wide block mb-2">By Provider</span>
      <div class="space-y-2">
        ${activeProviders.map(([providerId, stats]) => {
          const name = PROVIDER_NAMES[providerId as Provider] || providerId
          const color = PROVIDER_COLORS[providerId as Provider] || '#6b7280'
          return `
            <div class="bg-white/50 rounded p-2 border border-gray-100">
              <div class="flex items-center gap-2 mb-1">
                <span class="w-2 h-2 rounded-full" style="background: ${color}"></span>
                <span class="text-xs font-medium text-gray-700">${name}</span>
              </div>
              <div class="grid grid-cols-3 gap-2 text-xs">
                <div>
                  <span class="text-gray-500">Places</span>
                  <span class="block font-medium text-gray-800">${stats!.placesFound.toLocaleString()}</span>
                </div>
                <div>
                  <span class="text-gray-500">Requests</span>
                  <span class="block font-medium text-gray-800">${stats!.requestsMade.toLocaleString()}</span>
                </div>
                <div>
                  <span class="text-gray-500">Cost</span>
                  <span class="block font-medium text-gray-800">$${stats!.estimatedCost.toFixed(2)}</span>
                </div>
              </div>
            </div>
          `
        }).join('')}
      </div>
    </div>
  `
}

/**
 * Render map overlay controls
 */
function renderMapControls(): string {
  const isVisible = getOverlayVisibility()

  return `
    <!-- Map Controls -->
    <div class="mb-6">
      <h3 class="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">Map Controls</h3>
      <div class="bg-gray-50 border border-gray-200 rounded-lg p-3 space-y-3">
        <!-- Tile Grid Toggle -->
        <label class="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            id="overlay-visibility-toggle"
            class="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
            ${isVisible ? 'checked' : ''}
          />
          <div>
            <span class="text-sm font-medium text-gray-700">Show tile grid</span>
            <p class="text-xs text-gray-500">Display region bounds and tile status</p>
          </div>
        </label>

        <!-- Provider Visibility Toggles -->
        <div class="border-t border-gray-200 pt-3">
          <p class="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">Providers</p>
          <div class="space-y-2">
            ${Object.values(Provider).map(provider => {
              const name = PROVIDER_NAMES[provider]
              const color = PROVIDER_COLORS[provider]
              return `
                <label class="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    class="provider-visibility-toggle w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                    value="${provider}"
                    checked
                    data-color="${color}"
                  />
                  <span class="flex items-center gap-2">
                    <span class="w-3 h-3 rounded-full" style="background-color: ${color}"></span>
                    <span class="text-sm text-gray-700">${name}</span>
                  </span>
                </label>
              `
            }).join('')}
          </div>
        </div>

        <div class="mt-3 pt-3 border-t border-gray-200">
          <p class="text-xs text-gray-500 mb-2">Tile colors:</p>
          <div class="grid grid-cols-2 gap-1 text-xs">
            <div class="flex items-center gap-1.5">
              <span class="w-3 h-3 rounded" style="background: rgba(156, 163, 175, 0.5)"></span>
              <span class="text-gray-600">Pending</span>
            </div>
            <div class="flex items-center gap-1.5">
              <span class="w-3 h-3 rounded" style="background: rgba(251, 191, 36, 0.6)"></span>
              <span class="text-gray-600">Fetching</span>
            </div>
            <div class="flex items-center gap-1.5">
              <span class="w-3 h-3 rounded" style="background: rgba(34, 197, 94, 0.5)"></span>
              <span class="text-gray-600">Complete</span>
            </div>
            <div class="flex items-center gap-1.5">
              <span class="w-3 h-3 rounded" style="background: rgba(239, 68, 68, 0.6)"></span>
              <span class="text-gray-600">Failed</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
}

/**
 * Attach event listener for map controls
 */
function attachMapControlsListener(): void {
  const toggle = document.getElementById('overlay-visibility-toggle') as HTMLInputElement | null
  if (toggle) {
    toggle.addEventListener('change', (e) => {
      const target = e.target as HTMLInputElement
      setOverlayVisibility(target.checked)
    })
  }

  // Handle provider visibility toggles
  const providerToggles = document.querySelectorAll('.provider-visibility-toggle')
  if (providerToggles.length > 0) {
    const updateVisibility = () => {
      const visibleProviders: Provider[] = []
      providerToggles.forEach(toggle => {
        if ((toggle as HTMLInputElement).checked) {
          visibleProviders.push((toggle as HTMLInputElement).value as Provider)
        }
      })
      setMarkerProviderVisibility(visibleProviders)
    }

    providerToggles.forEach(toggle => {
      toggle.addEventListener('change', updateVisibility)
    })
  }
}




/**
 * Attach listeners for provider selection toggles (configuration)
 */
function attachProviderSelectListener(): void {
  const toggles = document.querySelectorAll('.provider-select-toggle')
  toggles.forEach(toggle => {
    toggle.addEventListener('change', (e) => {
      const target = e.target as HTMLInputElement

      toggleSelectedProvider(target.value as Provider)
    })
  })
}

/**
 * Render quick stats summary across all explorations
 */
function renderQuickStats(): string {
  const explorations = getAllExplorations()

  // Calculate aggregate totals
  const totals = explorations.reduce(
    (acc, exp) => ({
      tiles: acc.tiles + exp.stats.tilesCompleted,
      places: acc.places + exp.stats.placesFound,
      requests: acc.requests + exp.stats.requestsMade
    }),
    { tiles: 0, places: 0, requests: 0 }
  )

  // Calculate cost from total requests ($1.70 per 1000 requests)
  const totalCost = (totals.requests / 1000) * 1.70

  const hasData = explorations.length > 0

  return `
    <!-- Quick Stats -->
    <div>
      <h3 class="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">Quick Stats</h3>
      <div class="grid grid-cols-2 gap-2">
        <div class="bg-gray-50 rounded-lg p-2 text-center">
          <p class="text-lg font-semibold text-gray-800">${hasData ? totals.tiles.toLocaleString() : '--'}</p>
          <p class="text-xs text-gray-500">Tiles</p>
        </div>
        <div class="bg-gray-50 rounded-lg p-2 text-center">
          <p class="text-lg font-semibold text-gray-800">${hasData ? totals.places.toLocaleString() : '--'}</p>
          <p class="text-xs text-gray-500">Places</p>
        </div>
        <div class="bg-gray-50 rounded-lg p-2 text-center">
          <p class="text-lg font-semibold text-gray-800">${hasData ? totals.requests.toLocaleString() : '--'}</p>
          <p class="text-xs text-gray-500">Requests</p>
        </div>
        <div class="bg-gray-50 rounded-lg p-2 text-center" title="${hasData ? totals.requests.toLocaleString() + ' requests × $0.0017' : ''}">
          <p class="text-lg font-semibold text-gray-800">$${totalCost.toFixed(2)}</p>
          <p class="text-xs text-gray-500 flex items-center justify-center gap-1">
            Est. Cost
            <a href="https://www.mapbox.com/pricing" target="_blank" rel="noopener" title="Mapbox Pricing - $1.70 per 1000 requests" class="text-gray-400 hover:text-blue-500">
              <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd" />
              </svg>
            </a>
          </p>
        </div>
      </div>
    </div>
  `
}

/**
 * Attach event listeners to navbar region items
 */
function attachNavbarRegionListeners(): void {
  const navbarContainer = document.getElementById('regions-history')
  if (!navbarContainer) return

  // Handle region selection
  navbarContainer.querySelectorAll('.navbar-region-select-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const regionItem = (e.target as HTMLElement).closest('[data-navbar-region-id]')
      if (regionItem) {
        const regionId = regionItem.getAttribute('data-navbar-region-id')
        if (regionId) {
          switchToRegion(regionId)
        }
      }
    })
  })

  // Handle region removal
  navbarContainer.querySelectorAll('.navbar-region-remove-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation()
      e.preventDefault()
      const regionId = (e.currentTarget as HTMLElement).getAttribute('data-region-id')
      if (regionId) {
        removeRegion(regionId)
      }
    })
  })
}

/**
 * Attach event listener for tile size selection
 */
function attachTileSizeListener(): void {
  const tileSizeSelect = document.getElementById('tile-size-select') as HTMLSelectElement | null
  if (!tileSizeSelect) return

  tileSizeSelect.addEventListener('change', (e) => {
    const target = e.target as HTMLSelectElement
    const newSize = parseInt(target.value, 10)
    if (!isNaN(newSize)) {
      setTileSize(newSize)
    }
  })
}

/**
 * Attach event listeners for category selection (add/remove)
 */
function attachCategoryListener(): void {
  // Handle adding categories from dropdown
  const categoryAddSelect = document.getElementById('category-add-select') as HTMLSelectElement | null
  if (categoryAddSelect) {
    categoryAddSelect.addEventListener('change', (e) => {
      const target = e.target as HTMLSelectElement
      if (target.value) {
        addCategory(target.value)
      }
    })
  }

  // Handle removing categories via tag close buttons
  const categoryTags = document.getElementById('category-tags')
  if (categoryTags) {
    categoryTags.querySelectorAll('.category-remove-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const target = e.currentTarget as HTMLElement
        const categoryId = target.getAttribute('data-category')
        if (categoryId) {
          removeCategory(categoryId)
        }
      })
    })
  }
}

/**
 * Attach event listener for Start Exploration button
 */
function attachStartExplorationListener(): void {
  const startBtn = document.getElementById('start-exploration-btn')
  if (!startBtn) return

  startBtn.addEventListener('click', () => {
    const currentRegion = getCurrentRegion()
    if (currentRegion) {
      startExploration(currentRegion)
    }
  })
}

/**
 * Switch to a different region
 */
function switchToRegion(regionId: string): void {
  const regions = getRegions()
  const region = regions.find(r => r.id === regionId)

  if (!region) return

  setCurrentRegion(regionId)

  // Set the exploration for this region (if one exists)
  const exploration = getExplorationByRegion(regionId)
  setCurrentExploration(exploration?.id || null)

  // Zoom map to region bounds
  const [west, south, east, north] = region.bounds
  const hasBbox = Math.abs(east - west) > 0.001 && Math.abs(north - south) > 0.001

  if (hasBbox) {
    fitBounds(region.bounds)
  } else {
    const center: [number, number] = [(west + east) / 2, (south + north) / 2]
    flyTo(center, 10)
  }
}

/**
 * Render the empty state when no regions exist
 */
function renderEmptyState(): void {
  const html = `
    <div class="text-center py-8 text-gray-400">
      <svg class="w-12 h-12 mx-auto mb-3 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
      <p class="text-sm">No regions added</p>
      <p class="text-xs mt-1">Search for a region to begin</p>
    </div>
  `

  updateStatsContent(html)
}

/**
 * Escape HTML to prevent XSS
 */
function escapeHtml(text: string): string {
  const div = document.createElement('div')
  div.textContent = text
  return div.innerHTML
}
