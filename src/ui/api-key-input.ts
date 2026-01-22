/**
 * API Key input UI
 * Allows users to enter their Mapbox API key for the session
 */

import {
  hasMapboxToken,
  saveMapboxToken,
  saveGoogleToken,
  saveFoursquareToken,
  getEffectiveMapboxToken,
  getEffectiveGoogleToken,
  getEffectiveFoursquareToken
} from '../utils/config'

/**
 * Render the API key input form in the given container
 * @param container - The container element to render into
 * @param onSubmit - Callback when tokens are submitted
 */
export function renderApiKeyInput(
  container: HTMLElement,
  onSubmit: () => void,
  onCancel?: () => void
): void {
  // Pre-fill existing tokens if available
  const existingMapbox = getEffectiveMapboxToken() || ''
  const existingGoogle = getEffectiveGoogleToken() || ''
  const existingFoursquare = getEffectiveFoursquareToken() || ''
  
  // Decide if this is a modal (cancellable) or blocking (initial setup)
  const isModal = typeof onCancel === 'function'

  // If modal, use fixed overlay positioning
  const containerClasses = isModal 
    ? "fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
    : "flex items-center justify-center h-full bg-gray-50 overflow-y-auto py-8"

  const cardClasses = "max-w-md w-full bg-white rounded-lg shadow-xl my-auto relative flex flex-col max-h-full"

  container.innerHTML = `
    <div class="${containerClasses}" ${isModal ? 'id="api-key-modal-overlay"' : ''}>
      <div class="${cardClasses}">
        ${isModal ? `
          <button 
            type="button" 
            id="modal-close-btn"
            class="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        ` : ''}
        
        <div class="p-6 overflow-y-auto scrollbar-thin">
          <div class="text-center mb-6">
            <h2 class="text-xl font-semibold text-gray-800">API Configuration</h2>
            <p class="text-sm text-gray-500 mt-2">
              Configure your provider API keys.
              <br>
              <span class="text-blue-600 font-medium">Mapbox is required</span> for the base map.
            </p>
          </div>

          <form id="api-key-form" class="space-y-6">
            <!-- Mapbox Input -->
            <div>
              <label for="mapbox-input" class="block text-sm font-medium text-gray-700 mb-1">
                Mapbox Access Token <span class="text-red-500">*</span>
              </label>
              <input
                type="password"
                id="mapbox-input"
                value="${existingMapbox}"
                placeholder="pk.eyJ1Ijoi..."
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono text-sm"
                required
              />
              <p class="text-xs text-gray-400 mt-1">
                Required. <a href="https://account.mapbox.com/access-tokens/" target="_blank" rel="noopener" class="text-blue-500 hover:underline">Get token</a>
              </p>
            </div>

            <!-- Google Input -->
            <div>
              <label for="google-input" class="block text-sm font-medium text-gray-700 mb-1">
                Google Maps API Key <span class="text-gray-400 font-normal">(Optional)</span>
              </label>
              <input
                type="password"
                id="google-input"
                 value="${existingGoogle}"
                placeholder="AIzaSy..."
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono text-sm"
              />
              <p class="text-xs text-gray-400 mt-1">
                For Place Search. <a href="https://console.cloud.google.com/google/maps-apis/credentials" target="_blank" rel="noopener" class="text-blue-500 hover:underline">Get key</a>
              </p>
            </div>

            <!-- Foursquare Input -->
            <div>
              <label for="foursquare-input" class="block text-sm font-medium text-gray-700 mb-1">
                Foursquare API Key <span class="text-gray-400 font-normal">(Optional)</span>
              </label>
              <input
                type="password"
                id="foursquare-input"
                 value="${existingFoursquare}"
                placeholder="Foursquare API Key..."
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono text-sm"
              />
               <p class="text-xs text-gray-400 mt-1">
                For Place Search. <a href="https://foursquare.com/developers/orgs" target="_blank" rel="noopener" class="text-blue-500 hover:underline">Get key</a>
              </p>
            </div>

            <div class="flex items-center gap-2">
              <input
                type="checkbox"
                id="show-tokens"
                class="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <label for="show-tokens" class="text-sm text-gray-600">Show keys</label>
            </div>

            <div class="flex gap-3">
              ${isModal ? `
                <button
                  type="button"
                  id="modal-cancel-btn"
                  class="flex-1 py-2 px-4 bg-white border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-200"
                >
                  Cancel
                </button>
              ` : ''}
              <button
                type="submit"
                class="flex-1 py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                Save
              </button>
            </div>

            <p id="api-key-error" class="text-sm text-red-600 hidden text-center"></p>
          </form>

          <p class="text-xs text-gray-400 text-center mt-6">
            Keys are stored locally in your browser.
          </p>
        </div>
      </div>
    </div>
  `

  const form = container.querySelector('#api-key-form') as HTMLFormElement
  const mapboxInput = container.querySelector('#mapbox-input') as HTMLInputElement
  const googleInput = container.querySelector('#google-input') as HTMLInputElement
  const foursquareInput = container.querySelector('#foursquare-input') as HTMLInputElement
  const showTokensCheckbox = container.querySelector('#show-tokens') as HTMLInputElement
  const errorEl = container.querySelector('#api-key-error') as HTMLElement
  
  // Close handlers if modal
  if (isModal) {
    const closeBtn = container.querySelector('#modal-close-btn')
    const cancelBtn = container.querySelector('#modal-cancel-btn')
    const overlay = container.querySelector('#api-key-modal-overlay')

    const verifyAndClose = () => {
       // Only allow closing if mapbox token exists (sanity check, though cancel implies reverting)
       // Actually 'Cancel' should just close without saving.
       onCancel!()
    }

    closeBtn?.addEventListener('click', verifyAndClose)
    cancelBtn?.addEventListener('click', verifyAndClose)
    
    // Close on click outside
    overlay?.addEventListener('click', (e) => {
      if (e.target === overlay) verifyAndClose()
    })
    
    // Close on escape
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        verifyAndClose()
        document.removeEventListener('keydown', handleEsc)
      }
    }
    document.addEventListener('keydown', handleEsc)
  }

  // Toggle visibility
  showTokensCheckbox.addEventListener('change', () => {
    const type = showTokensCheckbox.checked ? 'text' : 'password'
    mapboxInput.type = type
    googleInput.type = type
    foursquareInput.type = type
  })

  // Handle submit
  form.addEventListener('submit', (e) => {
    e.preventDefault()

    const mapboxToken = mapboxInput.value.trim()
    const googleToken = googleInput.value.trim()
    const foursquareToken = foursquareInput.value.trim()

    // Validate Mapbox (Strictly required)
    if (!mapboxToken) {
      showError('Mapbox Access Token is required')
      return
    }

    if (!mapboxToken.startsWith('pk.')) {
      showError('Invalid Mapbox token format. Should start with "pk."')
      return
    }

    // Save tokens
    saveMapboxToken(mapboxToken)

    if (googleToken !== null) {
      saveGoogleToken(googleToken)
    }

    if (foursquareToken) {
      saveFoursquareToken(foursquareToken)
    }

    // Verify Mapbox saved correctly
    if (hasMapboxToken()) {
      onSubmit()
    } else {
      showError('Failed to save configuration')
    }
  })

  function showError(message: string): void {
    errorEl.textContent = message
    errorEl.classList.remove('hidden')
  }

  // Focus first input
  mapboxInput.focus()
}

/**
 * Check if API key input should be shown
 */
export function shouldShowApiKeyInput(): boolean {
  return !hasMapboxToken()
}
