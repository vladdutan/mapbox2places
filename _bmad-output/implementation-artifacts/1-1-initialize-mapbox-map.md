# Story 1.1: Initialize Mapbox Map

## Story

As a **user**,
I want **to see a fullscreen interactive map when I open the app**,
So that **I have a visual canvas for exploring geographic regions**.

## Status

review

## Acceptance Criteria

- [x] **AC1:** Given the user opens the app with a valid Mapbox token configured, when the page loads, then a fullscreen Mapbox map is displayed
- [x] **AC2:** The map defaults to a view of Europe (or reasonable default)
- [x] **AC3:** The map loads within 3 seconds (NFR5)
- [x] **AC4:** Given the user interacts with the map, when they pan or zoom, then the map responds at 60fps (NFR1)
- [x] **AC5:** Standard Mapbox navigation controls are visible

## Tasks/Subtasks

- [x] **Task 1:** Create map module structure
  - [x] Create `src/map/map.ts` for Mapbox initialization
  - [x] Define map configuration types in `src/types/map.types.ts`

- [x] **Task 2:** Initialize Mapbox GL JS
  - [x] Configure Mapbox access token handling
  - [x] Create map instance with container binding
  - [x] Set default style (mapbox://styles/mapbox/streets-v12)

- [x] **Task 3:** Configure default view
  - [x] Set initial center to Europe (longitude: 10, latitude: 50)
  - [x] Set appropriate zoom level (zoom: 4)
  - [x] Enable navigation controls (zoom, compass)

- [x] **Task 4:** Create fullscreen layout
  - [x] Update `index.html` with map container element
  - [x] Configure Tailwind CSS for fullscreen layout
  - [x] Import Mapbox GL CSS

- [x] **Task 5:** Integrate with application
  - [x] Update `main.ts` to initialize map on DOMContentLoaded
  - [x] Update state when map is ready (isMapReady: true)
  - [x] Dispatch `map:ready` event

## Dev Notes

**Architecture Requirements:**
- Map module goes in `src/map/` directory per architecture
- Use typed CustomEvents for map events
- Follow kebab-case file naming
- Use crypto.randomUUID() if any IDs needed

**Technical Specs:**
- Mapbox GL JS v3.x installed as dependency
- Token should be read from environment (import.meta.env.VITE_MAPBOX_TOKEN)
- Navigation controls: NavigationControl positioned top-right

**NFR Considerations:**
- NFR1: 60fps performance - don't add expensive operations to map events
- NFR5: <3s load time - initialize map early in page lifecycle

**Previous Learnings:**
- First story - no previous learnings

## Dev Agent Record

### Implementation Plan
1. Created map types file with MapConfig interface and default configuration
2. Created map.ts module with initializeMap(), getMap(), destroyMap() functions
3. Updated index.html with Mapbox GL CSS CDN link and fullscreen layout
4. Updated style.css with fullscreen body/container styles
5. Updated main.ts to initialize map on DOM ready with error handling

### Debug Log
- Build passed without errors
- CSS warning about unknown property is false positive from CSS minifier
- Chunk size warning is expected due to Mapbox GL JS (~1.6MB)

### Completion Notes
- Mapbox map initializes with streets-v12 style
- Default view centered on Europe (lng: 10, lat: 50, zoom: 4)
- NavigationControl added to top-right corner
- Map ready state updates store and dispatches `map:ready` event
- Error handling shows user-friendly message when token is missing
- Load time tracking logs to console with NFR5 warning threshold

## File List

| File | Action |
|------|--------|
| src/types/map.types.ts | Created |
| src/map/map.ts | Created |
| src/main.ts | Modified |
| src/style.css | Modified |
| index.html | Modified |

## Change Log

| Date | Change |
|------|--------|
| 2026-01-18 | Story created for implementation |
| 2026-01-18 | Completed all tasks - fullscreen Mapbox map with Europe view and navigation controls |
