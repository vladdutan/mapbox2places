# Story 3.2: Adjust Tile Size

## Story

As a **user**,
I want **to adjust the tile size before starting an exploration**,
So that **I can balance granularity vs. number of API requests** (FR6).

## Status

review

## Acceptance Criteria

- [x] **AC1:** Given the configuration panel is visible, when the user adjusts the tile size control, then predefined options are available (e.g., 250m, 500m, 1km, 2km)
- [x] **AC2:** The selected tile size is immediately reflected in the UI

## Tasks/Subtasks

- [x] **Task 1:** Add tile size selection control
  - [x] Create dropdown with tile size options
  - [x] Options: 250m, 500m, 1km, 2km
  - [x] Style consistently with config panel

- [x] **Task 2:** Store selected tile size in state
  - [x] Add tileSize to AppState type
  - [x] Add TILE_SIZE_OPTIONS constant
  - [x] Add getTileSize() and setTileSize() in store
  - [x] Default to 500m

- [x] **Task 3:** Update tile count when size changes
  - [x] Recalculate tile count using selected size
  - [x] Listen for 'config' state changes
  - [x] Update display immediately on change

## Dev Notes

**Architecture Requirements:**
- State managed in src/state/store.ts
- Event-driven updates using CustomEvent
- Tailwind CSS for styling

**UI Design:**
- Tile size control in Configuration section of stats panel
- Dropdown select element
- Show current selection clearly

**Previous Learnings from Story 3.1:**
- Configuration section already exists in stats panel
- estimateTileCount() available from tile-calculator
- DEFAULT_TILE_SIZE constant moved to store.ts

## Dev Agent Record

### Implementation Plan
1. Added tileSize to AppState interface in state.types.ts
2. Added DEFAULT_TILE_SIZE and TILE_SIZE_OPTIONS constants in store.ts
3. Added getTileSize() and setTileSize() functions in store.ts
4. Updated stats-panel.ts to import tile size functions from store
5. Added formatTileSize() helper to display sizes (250m, 500m, 1km, 2km)
6. Replaced static tile size display with dropdown select
7. Added state:changed listener for 'config' type
8. Added attachTileSizeListener() to handle dropdown change events

### Debug Log
- Build passed without errors

### Completion Notes
- Tile size dropdown shows 4 options: 250m, 500m, 1km, 2km
- Selecting a new size updates the store via setTileSize()
- State change dispatches 'config' event type
- Stats panel re-renders on config changes
- Tile count recalculates immediately with new size
- Default remains 500m for backward compatibility

## File List

| File | Action |
|------|--------|
| src/types/state.types.ts | Modified - added tileSize to AppState |
| src/state/store.ts | Modified - added DEFAULT_TILE_SIZE, TILE_SIZE_OPTIONS, getTileSize(), setTileSize() |
| src/ui/stats-panel.ts | Modified - added tile size dropdown, formatTileSize(), attachTileSizeListener() |

## Change Log

| Date | Change |
|------|--------|
| 2026-01-18 | Story created for implementation |
| 2026-01-18 | Completed all tasks - tile size selection with immediate UI update |

