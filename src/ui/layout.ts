/**
 * Layout components for the application shell
 * Renders search bar, stats panel, and manages layout structure
 */

/**
 * Render the complete application layout shell
 * @param container - The root container element
 */
export function renderLayout(container: HTMLElement): void {
  container.innerHTML = `
    <div class="flex flex-col h-screen w-screen overflow-hidden">
      <!-- Header with Search Bar -->
      <header id="header" class="flex-none h-14 bg-white border-b border-gray-200 shadow-sm z-10">
        <div class="flex items-center h-full px-4 gap-4">
          <h1 class="text-lg font-semibold text-gray-800 whitespace-nowrap">map2places</h1>
          <div id="search-container" class="flex-none max-w-md relative">
            <form id="search-form" class="relative flex gap-2">
              <div class="relative flex-1">
                <input
                  type="text"
                  id="search-input"
                  placeholder="Search for a region..."
                  class="w-full px-4 py-2 text-sm border border-gray-300 rounded-lg bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <div id="search-loading" class="hidden absolute right-3 top-1/2 -translate-y-1/2">
                  <svg class="animate-spin h-4 w-4 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                </div>
              </div>
              <button
                type="submit"
                id="search-button"
                class="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Search
              </button>
            </form>
            <!-- Search Results Dropdown -->
            <div id="search-results" class="hidden absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-80 overflow-y-auto">
            </div>
          </div>
          
          <!-- Divider -->
          <div class="h-8 w-px bg-gray-300 flex-none"></div>
          
          <!-- Regions History Container -->
          <div id="regions-history" class="flex-1 flex gap-2 overflow-x-auto items-center" style="scrollbar-width: thin;">
            <!-- Dynamically populated by stats-panel -->
          </div>
          
          <!-- Search Error Message -->
          <div id="search-error" class="hidden text-sm text-red-600 bg-red-50 px-3 py-1 rounded-lg flex-none"></div>
        </div>
      </header>

      <!-- Main Content Area -->
      <main class="flex-1 flex overflow-hidden relative">
        <!-- Map Container -->
        <div id="map" class="flex-1 h-full"></div>

        <!-- Stats Dashboard Panel -->
        <aside id="stats-panel" class="flex-none w-72 bg-white border-l border-gray-200 shadow-lg overflow-y-auto">
          <div class="p-4">
            <h2 class="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-4">Statistics</h2>

            <!-- Placeholder Stats -->
            <div id="stats-content" class="space-y-4">
              <div class="text-center py-8 text-gray-400">
                <svg class="w-12 h-12 mx-auto mb-3 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                <p class="text-sm">No exploration active</p>
                <p class="text-xs mt-1">Search for a region to begin</p>
              </div>
            </div>
          </div>
        </aside>
      </main>
    </div>
  `
}

/**
 * Get the map container element
 * @returns The map container element or null if not found
 */
export function getMapContainer(): HTMLElement | null {
  return document.getElementById('map')
}

/**
 * Get the stats panel element
 * @returns The stats panel element or null if not found
 */
export function getStatsPanel(): HTMLElement | null {
  return document.getElementById('stats-panel')
}

/**
 * Get the search input element
 * @returns The search input element or null if not found
 */
export function getSearchInput(): HTMLInputElement | null {
  return document.getElementById('search-input') as HTMLInputElement | null
}

/**
 * Update stats panel content
 * @param html - The HTML content to render in the stats panel
 */
export function updateStatsContent(html: string): void {
  const statsContent = document.getElementById('stats-content')
  if (statsContent) {
    statsContent.innerHTML = html
  }
}

/**
 * Get the search form element
 * @returns The search form element or null if not found
 */
export function getSearchForm(): HTMLFormElement | null {
  return document.getElementById('search-form') as HTMLFormElement | null
}

/**
 * Get the search button element
 * @returns The search button element or null if not found
 */
export function getSearchButton(): HTMLButtonElement | null {
  return document.getElementById('search-button') as HTMLButtonElement | null
}

/**
 * Show or hide the search loading indicator
 * @param show - Whether to show the loading indicator
 */
export function setSearchLoading(show: boolean): void {
  const loading = document.getElementById('search-loading')
  const button = getSearchButton()
  const input = getSearchInput()

  if (loading) {
    loading.classList.toggle('hidden', !show)
  }
  if (button) {
    button.disabled = show
  }
  if (input) {
    input.disabled = show
  }
}

/**
 * Show a search error message
 * @param message - The error message to display, or null to hide
 */
export function showSearchError(message: string | null): void {
  const errorEl = document.getElementById('search-error')
  if (errorEl) {
    if (message) {
      errorEl.textContent = message
      errorEl.classList.remove('hidden')
    } else {
      errorEl.classList.add('hidden')
    }
  }
}

/**
 * Get the search results container
 * @returns The search results element or null if not found
 */
export function getSearchResults(): HTMLElement | null {
  return document.getElementById('search-results')
}

/**
 * Show or hide the search results dropdown
 * @param show - Whether to show the results
 */
export function showSearchResults(show: boolean): void {
  const results = getSearchResults()
  if (results) {
    results.classList.toggle('hidden', !show)
  }
}

/**
 * Render search results in the dropdown
 * @param html - The HTML content to render
 */
export function renderSearchResults(html: string): void {
  const results = getSearchResults()
  if (results) {
    results.innerHTML = html
    showSearchResults(html.length > 0)
  }
}
