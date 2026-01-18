/**
 * Interactive region editor
 * Allows users to resize and reposition the region bounding box
 */

import type { Map as MapboxMap } from 'mapbox-gl'
import type { Bounds } from '../types/exploration.types'
import { getMap } from './map'
import { getCurrentRegion, getCurrentExploration, updateRegionBounds } from '../state/store'
import { ExplorationStatus } from '../types/exploration.types'

// Handle positions
type HandlePosition = 'nw' | 'ne' | 'se' | 'sw' | 'n' | 'e' | 's' | 'w' | 'move'

// Editor state
let isEditing = false
let activeHandle: HandlePosition | null = null
let dragStartLngLat: { lng: number; lat: number } | null = null
let originalBounds: Bounds | null = null

// Handle styling
const HANDLE_SIZE = 10
const HANDLE_COLOR = '#3b82f6' // blue-500
const HANDLE_BORDER = '#ffffff'

// DOM elements for handles
let handleElements: Map<HandlePosition, HTMLDivElement> = new Map()
let containerElement: HTMLDivElement | null = null

/**
 * Initialize the region editor
 * Sets up event listeners for interactive editing
 */
export function initializeRegionEditor(): void {
  const map = getMap()
  if (!map) {
    console.warn('Map not ready for region editor initialization')
    return
  }

  // Create container for handles
  createHandleContainer(map)

  // Listen for region changes to update handles
  window.addEventListener('state:changed', ((e: CustomEvent<{ type: string }>) => {
    if (e.detail.type === 'region' || e.detail.type === 'exploration') {
      updateHandles()
    }
  }) as EventListener)

  // Update handles on map move/zoom
  map.on('move', updateHandlePositions)
  map.on('zoom', updateHandlePositions)

  // Initial update
  updateHandles()
}

/**
 * Create the container element for handles
 */
function createHandleContainer(map: MapboxMap): void {
  containerElement = document.createElement('div')
  containerElement.className = 'region-editor-handles'
  containerElement.style.cssText = 'position: absolute; top: 0; left: 0; width: 100%; height: 100%; pointer-events: none; z-index: 10;'

  map.getContainer().appendChild(containerElement)

  // Create handles for corners and edges
  const positions: HandlePosition[] = ['nw', 'n', 'ne', 'e', 'se', 's', 'sw', 'w']
  positions.forEach(pos => createHandle(pos))
}

/**
 * Create a single handle element
 */
function createHandle(position: HandlePosition): void {
  if (!containerElement) return

  const handle = document.createElement('div')
  handle.className = `region-handle region-handle-${position}`
  handle.style.cssText = `
    position: absolute;
    width: ${HANDLE_SIZE}px;
    height: ${HANDLE_SIZE}px;
    background: ${HANDLE_COLOR};
    border: 2px solid ${HANDLE_BORDER};
    border-radius: 2px;
    cursor: ${getCursorForHandle(position)};
    pointer-events: auto;
    display: none;
    transform: translate(-50%, -50%);
    box-shadow: 0 1px 3px rgba(0,0,0,0.3);
  `

  // Mouse events
  handle.addEventListener('mousedown', (e) => startDrag(e, position))

  containerElement.appendChild(handle)
  handleElements.set(position, handle)
}

/**
 * Get appropriate cursor for handle position
 */
function getCursorForHandle(position: HandlePosition): string {
  const cursors: Record<HandlePosition, string> = {
    'nw': 'nw-resize',
    'n': 'n-resize',
    'ne': 'ne-resize',
    'e': 'e-resize',
    'se': 'se-resize',
    's': 's-resize',
    'sw': 'sw-resize',
    'w': 'w-resize',
    'move': 'move'
  }
  return cursors[position]
}

/**
 * Update handles visibility and position
 */
function updateHandles(): void {
  const region = getCurrentRegion()

  // No region = no handles
  if (!region) {
    hideAllHandles()
    removeMapDragListener()
    return
  }

  // Check if THIS region has an active exploration
  const exploration = getCurrentExploration()
  const isExplorationActiveForThisRegion = exploration &&
    exploration.regionId === region.id &&
    (exploration.status === ExplorationStatus.Running ||
     exploration.status === ExplorationStatus.Completed)

  if (isExplorationActiveForThisRegion) {
    hideAllHandles()
    removeMapDragListener()
    return
  }

  showAllHandles()
  updateHandlePositions()
  addMapDragListener()
}

/**
 * Show all handle elements
 */
function showAllHandles(): void {
  handleElements.forEach(handle => {
    handle.style.display = 'block'
  })
}

/**
 * Hide all handle elements
 */
function hideAllHandles(): void {
  handleElements.forEach(handle => {
    handle.style.display = 'none'
  })
}

/**
 * Update handle positions based on current region bounds
 */
function updateHandlePositions(): void {
  const map = getMap()
  const region = getCurrentRegion()
  if (!map || !region) return

  const [west, south, east, north] = region.bounds

  // Calculate screen positions for each handle
  const positions: Record<HandlePosition, { lng: number; lat: number }> = {
    'nw': { lng: west, lat: north },
    'n': { lng: (west + east) / 2, lat: north },
    'ne': { lng: east, lat: north },
    'e': { lng: east, lat: (north + south) / 2 },
    'se': { lng: east, lat: south },
    's': { lng: (west + east) / 2, lat: south },
    'sw': { lng: west, lat: south },
    'w': { lng: west, lat: (north + south) / 2 },
    'move': { lng: (west + east) / 2, lat: (north + south) / 2 }
  }

  handleElements.forEach((handle, pos) => {
    const lngLat = positions[pos]
    const point = map.project([lngLat.lng, lngLat.lat])
    handle.style.left = `${point.x}px`
    handle.style.top = `${point.y}px`
  })
}

/**
 * Add listener for dragging the entire region
 */
function addMapDragListener(): void {
  const map = getMap()
  if (!map) return

  // Add a transparent overlay for move detection on the region fill
  map.on('mousedown', 'region-fill', onRegionMouseDown)
  map.on('mouseenter', 'region-fill', onRegionMouseEnter)
  map.on('mouseleave', 'region-fill', onRegionMouseLeave)
}

/**
 * Remove map drag listener
 */
function removeMapDragListener(): void {
  const map = getMap()
  if (!map) return

  map.off('mousedown', 'region-fill', onRegionMouseDown)
  map.off('mouseenter', 'region-fill', onRegionMouseEnter)
  map.off('mouseleave', 'region-fill', onRegionMouseLeave)
}

/**
 * Handle mouse enter on region fill
 */
function onRegionMouseEnter(): void {
  const map = getMap()
  if (map && !isEditing) {
    map.getCanvas().style.cursor = 'move'
  }
}

/**
 * Handle mouse leave on region fill
 */
function onRegionMouseLeave(): void {
  const map = getMap()
  if (map && !isEditing) {
    map.getCanvas().style.cursor = ''
  }
}

/**
 * Handle mouse down on region fill (start move)
 */
function onRegionMouseDown(e: mapboxgl.MapMouseEvent): void {
  // Check if clicking on a handle (handles are on top)
  if (activeHandle) return

  startDrag(e.originalEvent, 'move')
  e.preventDefault()
}

/**
 * Start drag operation
 */
function startDrag(e: MouseEvent, position: HandlePosition): void {
  const map = getMap()
  const region = getCurrentRegion()
  if (!map || !region) return

  e.preventDefault()
  e.stopPropagation()

  isEditing = true
  activeHandle = position
  originalBounds = [...region.bounds] as Bounds

  const rect = map.getContainer().getBoundingClientRect()
  const mapPoint: [number, number] = [e.clientX - rect.left, e.clientY - rect.top]
  const lngLat = map.unproject(mapPoint)
  dragStartLngLat = { lng: lngLat.lng, lat: lngLat.lat }

  // Disable map dragging during resize
  map.dragPan.disable()

  // Add document-level listeners
  document.addEventListener('mousemove', onMouseMove)
  document.addEventListener('mouseup', onMouseUp)
}

/**
 * Handle mouse move during drag
 */
function onMouseMove(e: MouseEvent): void {
  if (!isEditing || !activeHandle || !dragStartLngLat || !originalBounds) return

  const map = getMap()
  const region = getCurrentRegion()
  if (!map || !region) return

  const rect = map.getContainer().getBoundingClientRect()
  const mapPoint: [number, number] = [e.clientX - rect.left, e.clientY - rect.top]
  const lngLat = map.unproject(mapPoint)

  const deltaLng = lngLat.lng - dragStartLngLat.lng
  const deltaLat = lngLat.lat - dragStartLngLat.lat

  const [west, south, east, north] = originalBounds
  let newBounds: Bounds

  // Calculate new bounds based on handle position
  switch (activeHandle) {
    case 'move':
      newBounds = [
        west + deltaLng,
        south + deltaLat,
        east + deltaLng,
        north + deltaLat
      ]
      break
    case 'nw':
      newBounds = [
        Math.min(west + deltaLng, east - 0.001),
        south,
        east,
        Math.max(north + deltaLat, south + 0.001)
      ]
      break
    case 'n':
      newBounds = [west, south, east, Math.max(north + deltaLat, south + 0.001)]
      break
    case 'ne':
      newBounds = [
        west,
        south,
        Math.max(east + deltaLng, west + 0.001),
        Math.max(north + deltaLat, south + 0.001)
      ]
      break
    case 'e':
      newBounds = [west, south, Math.max(east + deltaLng, west + 0.001), north]
      break
    case 'se':
      newBounds = [
        west,
        Math.min(south + deltaLat, north - 0.001),
        Math.max(east + deltaLng, west + 0.001),
        north
      ]
      break
    case 's':
      newBounds = [west, Math.min(south + deltaLat, north - 0.001), east, north]
      break
    case 'sw':
      newBounds = [
        Math.min(west + deltaLng, east - 0.001),
        Math.min(south + deltaLat, north - 0.001),
        east,
        north
      ]
      break
    case 'w':
      newBounds = [Math.min(west + deltaLng, east - 0.001), south, east, north]
      break
    default:
      return
  }

  // Update bounds
  updateRegionBounds(region.id, newBounds)
}

/**
 * Handle mouse up - end drag
 */
function onMouseUp(): void {
  const map = getMap()

  isEditing = false
  activeHandle = null
  dragStartLngLat = null
  originalBounds = null

  // Re-enable map dragging
  if (map) {
    map.dragPan.enable()
    map.getCanvas().style.cursor = ''
  }

  // Remove document-level listeners
  document.removeEventListener('mousemove', onMouseMove)
  document.removeEventListener('mouseup', onMouseUp)
}
