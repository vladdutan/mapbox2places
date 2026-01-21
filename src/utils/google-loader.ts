import { logError } from './logger'

declare global {
  interface Window {
    google?: any
    initGoogleMaps?: () => void
  }
}

let loaderPromise: Promise<void> | null = null

/**
 * Load Google Maps JavaScript API
 * @param apiKey Google Cloud Console API Key
 * @returns Promise that resolves when the API is loaded
 */
export function loadGoogleMaps(apiKey: string): Promise<void> {
  if (loaderPromise) return loaderPromise

  if (window.google?.maps) {
    return Promise.resolve()
  }

  loaderPromise = new Promise((resolve, reject) => {
    // Check if script is already present
    const existingScript = document.querySelector('script[src^="https://maps.googleapis.com/maps/api/js"]')
    if (existingScript) {
      if (window.google?.maps) {
        resolve()
      } else {
        // Wait for it to load
        existingScript.addEventListener('load', () => resolve())
        existingScript.addEventListener('error', () => reject(new Error('Google Maps script failed to load')))
      }
      return
    }

    // Callback function name
    const callbackName = 'initGoogleMaps'
    window[callbackName] = () => {
      resolve()
      delete window[callbackName]
    }

    const script = document.createElement('script')
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places&callback=${callbackName}`
    script.async = true
    script.defer = true
    script.onerror = (e) => {
      logError('Failed to load Google Maps script', e)
      reject(new Error('Failed to load Google Maps script'))
      loaderPromise = null // Allow retry
    }

    document.head.appendChild(script)
  })

  return loaderPromise
}

/**
 * Check if Google Maps API is loaded
 */
export function isGoogleMapsLoaded(): boolean {
  return !!(window.google && window.google.maps)
}
