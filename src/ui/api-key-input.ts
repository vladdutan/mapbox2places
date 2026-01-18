/**
 * API Key input UI
 * Allows users to enter their Mapbox API key for the session
 */

import { hasMapboxToken, saveMapboxToken } from '../utils/config'

/**
 * Render the API key input form in the given container
 * @param container - The container element to render into
 * @param onSubmit - Callback when a valid token is submitted
 */
export function renderApiKeyInput(
  container: HTMLElement,
  onSubmit: () => void
): void {
  container.innerHTML = `
    <div class="flex items-center justify-center h-full bg-gray-50">
      <div class="max-w-md w-full mx-4 p-6 bg-white rounded-lg shadow-lg">
        <div class="text-center mb-6">
          <svg class="w-12 h-12 mx-auto text-blue-500 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
          </svg>
          <h2 class="text-xl font-semibold text-gray-800">Mapbox API Key Required</h2>
          <p class="text-sm text-gray-500 mt-2">
            Enter your Mapbox access token to use the map.
            <a href="https://account.mapbox.com/access-tokens/" target="_blank" rel="noopener" class="text-blue-500 hover:underline">
              Get one here
            </a>
          </p>
        </div>

        <form id="api-key-form" class="space-y-4">
          <div>
            <label for="api-key-input" class="block text-sm font-medium text-gray-700 mb-1">
              Access Token
            </label>
            <input
              type="password"
              id="api-key-input"
              name="apiKey"
              placeholder="pk.eyJ1Ijoi..."
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono text-sm"
              autocomplete="off"
              required
            />
          </div>

          <div class="flex items-center gap-2">
            <input
              type="checkbox"
              id="show-token"
              class="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <label for="show-token" class="text-sm text-gray-600">Show token</label>
          </div>

          <button
            type="submit"
            class="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Continue
          </button>

          <p id="api-key-error" class="text-sm text-red-600 hidden"></p>
        </form>

        <p class="text-xs text-gray-400 text-center mt-4">
          Your token is stored locally in your browser and never sent to any server.
        </p>
      </div>
    </div>
  `

  // Attach event listeners
  const form = container.querySelector('#api-key-form') as HTMLFormElement
  const input = container.querySelector('#api-key-input') as HTMLInputElement
  const showTokenCheckbox = container.querySelector('#show-token') as HTMLInputElement
  const errorEl = container.querySelector('#api-key-error') as HTMLElement

  // Toggle password visibility
  showTokenCheckbox.addEventListener('change', () => {
    input.type = showTokenCheckbox.checked ? 'text' : 'password'
  })

  // Handle form submission
  form.addEventListener('submit', (e) => {
    e.preventDefault()

    const token = input.value.trim()

    if (!token) {
      showError('Please enter your API key')
      return
    }

    if (!token.startsWith('pk.')) {
      showError('Invalid token format. Token should start with "pk."')
      return
    }

    // Save token to localStorage and session state
    saveMapboxToken(token)

    // Verify token was saved
    if (hasMapboxToken()) {
      onSubmit()
    } else {
      showError('Failed to save token')
    }
  })

  function showError(message: string): void {
    errorEl.textContent = message
    errorEl.classList.remove('hidden')
  }

  // Focus input on load
  input.focus()
}

/**
 * Check if API key input should be shown
 */
export function shouldShowApiKeyInput(): boolean {
  return !hasMapboxToken()
}
