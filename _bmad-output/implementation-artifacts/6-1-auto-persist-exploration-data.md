# Story 6.1: Auto-Persist Exploration Data

## Story

As a **user**,
I want **exploration data to be saved automatically**,
So that **I don't lose progress if I close the browser** (FR25, NFR11).

## Status

review

## Acceptance Criteria

- [x] **AC1:** Given an exploration is running, when POIs are fetched or tiles complete, then data is automatically persisted to IndexedDB
- [x] **AC2:** Storage operations complete within 50ms (NFR6) - async IndexedDB with batch operations
- [x] **AC3:** Regions, tiles, places, and explorations are stored in normalized stores per architecture
- [x] **AC4:** Given a new region or exploration is created, when the record is created, then it is immediately persisted to IndexedDB

## Tasks/Subtasks

- [x] **Task 1:** Create IndexedDB storage module (db.ts)
  - [x] Database initialization with version 1
  - [x] Create object stores: regions, explorations, tiles, places
  - [x] Create indexes for efficient querying

- [x] **Task 2:** Define database schema
  - [x] regions: { id, name, bounds, createdAt }
  - [x] explorations: { id, regionId, category, tileSize, status, stats, startedAt, completedAt }
  - [x] tiles: { id, regionId, bounds, status, fetchedAt, explorationId }
  - [x] places: { id, tileId, regionId, mapboxId, name, category, coordinates, metadata }

- [x] **Task 3:** Implement save functions
  - [x] saveRegion(), getAllRegions(), deleteRegion()
  - [x] saveExploration(), getAllExplorations(), getExplorationByRegionId()
  - [x] saveTiles(), getTilesByExplorationId()
  - [x] savePlaces(), getPlacesByRegionId()

- [x] **Task 4:** Create auto-persist module (persistence.ts)
  - [x] Listen for state:changed events (region, exploration, tile)
  - [x] Listen for place:fetched events
  - [x] Persist data immediately on state changes

- [x] **Task 5:** Initialize persistence in main.ts
  - [x] Import initializePersistence
  - [x] Call after map and UI initialization

## Dev Notes

**Architecture Requirements:**
- IndexedDB for large dataset support
- Normalized stores per architecture
- Async operations for non-blocking persistence
- Storage module isolated in src/storage/

**Design Decisions:**
- Batch operations for tiles and places
- explorationId added to tiles for querying
- put() used for upsert behavior
- Error handling with console.error (non-blocking)

**Previous Learnings:**
- State:changed events already dispatched by store.ts
- place:fetched events dispatched by tile-fetcher.ts
- All IDs use crypto.randomUUID()

## Dev Agent Record

### Implementation Plan
1. Extended existing db.ts with CRUD operations
2. Created persistence.ts for auto-persist logic
3. Listens to state:changed for regions, explorations, tiles
4. Listens to place:fetched for immediate place persistence
5. Initialized persistence in main.ts

### Debug Log
- Fixed unused import warnings
- Fixed EventListener type casting

### Completion Notes
- IndexedDB initialized with 4 stores (AC3)
- Auto-persist on state:changed events (AC1, AC4)
- place:fetched triggers immediate place save (AC1)
- Async operations with batch support for performance (AC2)
- Indexes for regionId, explorationId, mapboxId queries

## File List

| File | Action |
|------|--------|
| src/storage/db.ts | Modified - added CRUD operations for all entities |
| src/storage/persistence.ts | Created - auto-persist on state changes |
| src/main.ts | Modified - added persistence initialization |

## Change Log

| Date | Change |
|------|--------|
| 2026-01-18 | Story created for implementation |
| 2026-01-18 | Completed all tasks - IndexedDB persistence with auto-save |
