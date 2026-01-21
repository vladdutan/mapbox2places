/**
 * Place details modal
 * Displays place information when a marker is clicked
 */

import type { Place } from '../types/exploration.types'
import type { PlaceSelectedPayload } from '../types/events.types'
import { PROVIDER_NAMES } from '../types/provider.types'
import { POI_CATEGORIES } from '../state/store'

const MODAL_CONTAINER_ID = 'place-modal-container'

/**
 * Initialize the place details modal
 * Creates modal container and sets up event listeners
 */
export function initializePlaceModal(): void {
  // Create modal container if it doesn't exist
  if (!document.getElementById(MODAL_CONTAINER_ID)) {
    const container = document.createElement('div')
    container.id = MODAL_CONTAINER_ID
    document.body.appendChild(container)
  }

  // Listen for place:selected events
  window.addEventListener('place:selected', ((e: CustomEvent<PlaceSelectedPayload>) => {
    showPlaceModal(e.detail.place)
  }) as EventListener)

  // Listen for escape key to close modal
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closePlaceModal()
    }
  })
}

/**
 * Show the place details modal
 * @param place - The place to display
 */
export function showPlaceModal(place: Place): void {
  const container = document.getElementById(MODAL_CONTAINER_ID)
  if (!container) return

  // Get category label
  const categoryLabel = POI_CATEGORIES.find(c => c.id === place.category)?.label || place.category

  // Build address display - try multiple fields
  const addressText = place.metadata.fullAddress
    || place.metadata.placeFormatted
    || place.metadata.address
  const addressHtml = addressText
    ? `<p class="text-sm text-gray-600">${escapeHtml(addressText)}</p>`
    : '<p class="text-sm text-gray-400 italic">Address not available</p>'

  container.innerHTML = `
    <!-- Modal Backdrop -->
    <div
      id="place-modal-backdrop"
      class="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-4"
    >
      <!-- Modal Content -->
      <div
        id="place-modal-content"
        class="bg-white rounded-t-xl sm:rounded-xl shadow-xl w-full max-w-md max-h-[80vh] overflow-hidden animate-slide-up"
        role="dialog"
        aria-modal="true"
        aria-labelledby="place-modal-title"
      >
        <!-- Modal Header -->
        <div class="flex items-start justify-between p-4 border-b border-gray-200">
          <div class="flex-1 pr-4">
            <h2 id="place-modal-title" class="text-lg font-semibold text-gray-900 leading-tight">
              ${escapeHtml(place.name)}
            </h2>
            <span class="inline-block mt-1 px-2 py-0.5 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
              ${escapeHtml(categoryLabel)}
            </span>
          </div>
          <button
            id="place-modal-close"
            type="button"
            class="flex-shrink-0 p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="Close modal"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <!-- Modal Body -->
        <div class="p-4 space-y-4">
          <!-- Address -->
          <div>
            <h3 class="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Address</h3>
            ${addressHtml}
          </div>

          <!-- Coordinates -->
          <div>
            <h3 class="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Coordinates</h3>
            <p class="text-sm text-gray-600 font-mono">
              ${place.coordinates[1].toFixed(6)}, ${place.coordinates[0].toFixed(6)}
            </p>
          </div>

          <!-- Provider ID -->
          <div>
            <h3 class="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Source</h3>
            <p class="text-sm text-gray-600">${PROVIDER_NAMES[place.provider]}</p>
            <p class="text-xs text-gray-400 font-mono truncate mt-1" title="${escapeHtml(place.providerId)}">
              ${escapeHtml(place.providerId)}
            </p>
          </div>
        </div>
      </div>
    </div>
  `

  // Add event listeners for closing
  const backdrop = document.getElementById('place-modal-backdrop')
  const closeBtn = document.getElementById('place-modal-close')
  const content = document.getElementById('place-modal-content')

  // Close on backdrop click (but not content click)
  backdrop?.addEventListener('click', (e) => {
    if (e.target === backdrop) {
      closePlaceModal()
    }
  })

  // Close on close button click
  closeBtn?.addEventListener('click', closePlaceModal)

  // Prevent content clicks from closing
  content?.addEventListener('click', (e) => {
    e.stopPropagation()
  })
}

/**
 * Close the place details modal
 */
export function closePlaceModal(): void {
  const container = document.getElementById(MODAL_CONTAINER_ID)
  if (container) {
    container.innerHTML = ''
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
