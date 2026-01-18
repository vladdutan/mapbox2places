# Story 6.2: Restore Previous Explorations on Load

## Story

As a **user**,
I want **to see my previous explorations when I return to the app**,
So that **I can continue where I left off** (FR26, NFR12).

## Status

complete

## Acceptance Criteria

- [x] **AC1:** Given the user has previous exploration data in IndexedDB, when the app loads, then all regions are restored from storage
- [x] **AC2:** All explorations are restored with their status
- [x] **AC3:** The app state reflects the persisted data
- [x] **AC4:** Restoration completes during initial load (<3s total)

## Tasks/Subtasks

- [x] **Task 1:** Add restore functions to store.ts
  - [x] restoreRegions() - restore regions without triggering events
  - [x] restoreExplorations() - restore explorations without triggering events
  - [x] restorePlaces() - restore places for each region
  - [x] restoreTiles() - restore tiles for each exploration
  - [x] notifyRestoreComplete() - dispatch events after all data restored

- [x] **Task 2:** Create restoreFromStorage() function in persistence.ts
  - [x] Initialize database
  - [x] Load all regions with getAllRegions()
  - [x] Load all explorations with getAllExplorations()
  - [x] Load places for each region with getPlacesByRegionId()
  - [x] Load tiles for each exploration with getTilesByExplorationId()
  - [x] Notify UI when restore is complete

- [x] **Task 3:** Call restoreFromStorage() in main.ts
  - [x] Import restoreFromStorage from persistence.ts
  - [x] Call after initializePersistence() in init()

- [x] **Task 4:** Verify build passes

## Dev Notes

**Architecture Requirements:**
- Restore functions should NOT dispatch events (to avoid persistence loop)
- Event dispatch happens once at the end via notifyRestoreComplete()
- Async restoration to not block UI

**Design Decisions:**
- Restore happens after persistence initialization
- Regions restored first, then explorations, then places, then tiles
- Places loaded per region, tiles loaded per exploration
- Console logging for debugging restored counts

**Previous Learnings:**
- Story 6.1 established the IndexedDB layer and auto-persist pattern
- All CRUD operations already exist in db.ts

## Dev Agent Record

### Implementation Plan
1. Added restore functions to store.ts (no event dispatch)
2. Created restoreFromStorage() in persistence.ts
3. Called restoreFromStorage() in main.ts init()

### Debug Log
- No errors encountered

### Completion Notes
- All restore functions added to store.ts (AC3)
- restoreFromStorage() loads regions, explorations, places, tiles in sequence (AC1, AC2)
- Data restored during app initialization (AC4)
- No events dispatched during restore to avoid persistence loops

## File List

| File | Action |
|------|--------|
| src/state/store.ts | Modified - added restore functions |
| src/storage/persistence.ts | Modified - added restoreFromStorage() |
| src/main.ts | Modified - call restoreFromStorage() on init |

## Change Log

| Date | Change |
|------|--------|
| 2026-01-18 | Story created for implementation |
| 2026-01-18 | Completed - restore functions and initialization |
