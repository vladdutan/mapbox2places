# Story 4.1: Start Exploration

## Story

As a **user**,
I want **to start an exploration with a single click**,
So that **POI fetching begins for my configured region and category** (FR10).

## Status

review

## Acceptance Criteria

- [x] **AC1:** Given a region, tile size, and category are configured, when the user clicks "Start Exploration", then an exploration record is created with status "running"
- [x] **AC2:** The tile grid is generated using tile-calculator
- [x] **AC3:** The UI transitions to show exploration in progress
- [x] **AC4:** An `exploration:started` event is dispatched per architecture

## Tasks/Subtasks

- [x] **Task 1:** Add Start Exploration button
  - [x] Add button to configuration panel
  - [x] Only shown when region is selected
  - [x] Style as primary action button (blue)

- [x] **Task 2:** Create exploration record
  - [x] Generate exploration with crypto.randomUUID()
  - [x] Set status to "running"
  - [x] Include regionId, category, tileSize
  - [x] Initialize stats with tile count
  - [x] Store via addExploration()

- [x] **Task 3:** Generate tile grid
  - [x] Use calculateTileGrid() from tile-calculator
  - [x] Store tiles in state keyed by explorationId
  - [x] Add setTiles() and getTiles() functions to store

- [x] **Task 4:** Dispatch exploration:started event
  - [x] Create typed ExplorationStartedPayload interface
  - [x] Dispatch CustomEvent with exploration and tileCount

- [x] **Task 5:** Update UI for exploration state
  - [x] Show running exploration in stats panel
  - [x] Display progress bar and stats
  - [x] Config changes disabled during exploration (panel shows status instead)

## Dev Notes

**Architecture Requirements:**
- Use calculateTileGrid() from src/exploration/tile-calculator.ts
- Events follow category:action pattern
- All IDs via crypto.randomUUID()
- Dates as ISO 8601 strings

**UI Design:**
- "Start Exploration" button below config section
- Button disabled if no region selected
- Show exploration status when running

**Previous Learnings:**
- Exploration type already defined with stats
- addExploration() and setCurrentExploration() exist in store
- Tile grid calculation tested in tile-calculator

## Dev Agent Record

### Implementation Plan
1. Added Tile type import to store.ts
2. Added setTiles() and getTiles() functions to store
3. Created exploration-manager.ts with startExploration() function
4. startExploration creates exploration record, generates tiles, stores in state
5. ExplorationStartedPayload interface for typed event
6. Updated stats-panel.ts imports for exploration-related functions
7. Added Start Exploration button to renderCurrentRegionInfo
8. Added renderExplorationStatus() for running exploration UI
9. Added attachStartExplorationListener() for button click handling
10. Stats panel now listens for 'exploration' and 'tile' state changes

### Debug Log
- Build passed without errors

### Completion Notes
- Start Exploration button appears when region is selected
- Clicking button creates exploration with status "running"
- Tile grid generated and stored in state
- exploration:started event dispatched with exploration and tileCount
- UI transitions to show exploration status with:
  - Category and tile size (read-only)
  - Progress bar (tiles completed / total)
  - Places found counter
- Config dropdowns hidden during exploration (replaced by status display)

## File List

| File | Action |
|------|--------|
| src/state/store.ts | Modified - added Tile import, setTiles(), getTiles() |
| src/exploration/exploration-manager.ts | Created - startExploration(), ExplorationStartedPayload |
| src/ui/stats-panel.ts | Modified - Start button, exploration status UI, event listeners |

## Change Log

| Date | Change |
|------|--------|
| 2026-01-18 | Story created for implementation |
| 2026-01-18 | Completed all tasks - exploration start with UI transition |

