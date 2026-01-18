# Story 6.3: View Cached POIs Without Re-fetching

## Story

As a **user**,
I want **to view previously fetched POIs on the map without re-fetching**,
So that **I can explore results offline** (FR27).

## Status

complete

## Acceptance Criteria

- [x] **AC1:** Given an exploration was previously completed, when the user selects that region, then all cached POIs are loaded from IndexedDB
- [x] **AC2:** Markers appear on the map from cached data
- [x] **AC3:** No new API requests are made for existing data
- [x] **AC4:** Given the user is offline, when they view a previously explored region, then cached POIs are still displayed on the map

## Tasks/Subtasks

- [x] **Task 1:** Verify data restoration flow (completed in Story 6.2)
  - [x] Places restored from IndexedDB to state on app load
  - [x] Places keyed by regionId in state.places Map

- [x] **Task 2:** Verify region selection displays cached markers
  - [x] switchToRegion() sets currentExploration for the region
  - [x] state:changed event triggers marker layer update
  - [x] updateMarkersForCurrentRegion() reads places from state
  - [x] Markers displayed without API calls

- [x] **Task 3:** Verify offline functionality
  - [x] IndexedDB data persists across browser sessions
  - [x] State restored from IndexedDB on app load
  - [x] No network requests needed to display cached markers

## Dev Notes

**Architecture:**
- IndexedDB stores places keyed by regionId
- App state (store.ts) holds places in memory after restoration
- Marker layer reads from state, not directly from IndexedDB
- This is more efficient than querying IndexedDB on each region switch

**Existing Implementation (from previous stories):**
- Story 6.1: Auto-persist places to IndexedDB via place:fetched listener
- Story 6.2: Restore places from IndexedDB to state via restoreFromStorage()
- Story 5.1-5.2: Marker layer displays places from state

**Flow:**
1. App loads → restoreFromStorage() loads places into state
2. User clicks region → switchToRegion() sets currentExploration
3. state:changed event fires → marker layer calls updateMarkersForCurrentRegion()
4. getPlaces(regionId) returns cached places from state
5. Markers rendered on map (no API calls)

## Dev Agent Record

### Implementation Plan
No new code needed - functionality already implemented by:
- src/storage/persistence.ts (restoreFromStorage)
- src/state/store.ts (restorePlaces, getPlaces)
- src/ui/stats-panel.ts (switchToRegion)
- src/map/marker-layer.ts (updateMarkersForCurrentRegion)

### Debug Log
- No errors encountered

### Completion Notes
- All ACs satisfied by existing implementation from Stories 6.1 and 6.2
- Verified build passes
- Places are cached in IndexedDB and restored to state on load
- Selecting a region displays cached markers without API requests
- Works offline since data is already in memory from IndexedDB

## File List

| File | Action |
|------|--------|
| (No changes) | Functionality already implemented in previous stories |

## Change Log

| Date | Change |
|------|--------|
| 2026-01-18 | Story created for implementation |
| 2026-01-18 | Completed - verified existing implementation satisfies all ACs |
