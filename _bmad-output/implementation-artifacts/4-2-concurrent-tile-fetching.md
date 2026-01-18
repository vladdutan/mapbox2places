# Story 4.2: Concurrent Tile Fetching with Rate Limiting

## Story

As a **user**,
I want **tiles to be fetched concurrently but within API limits**,
So that **exploration is fast but doesn't get throttled** (FR11, NFR7).

## Status

review

## Acceptance Criteria

- [x] **AC1:** Given an exploration is running, when tiles are being fetched, then maximum 5 concurrent requests are active (per architecture)
- [x] **AC2:** The request queue manages pending tiles
- [x] **AC3:** Failed requests retry with exponential backoff (3 retries)
- [x] **AC4:** The UI remains responsive during fetching (NFR4)

## Tasks/Subtasks

- [x] **Task 1:** Create category search API module
  - [x] Implement fetchPlacesByCategory() using Mapbox Search API
  - [x] Use queue's enqueue() for rate limiting
  - [x] Handle API response and errors
  - [x] Map features to Place objects

- [x] **Task 2:** Create tile fetcher module
  - [x] Process tiles from exploration
  - [x] Call category search for each tile
  - [x] Update tile status (fetching, complete, failed)

- [x] **Task 3:** Update exploration stats
  - [x] Increment tilesCompleted on success
  - [x] Increment tilesFailed on failure
  - [x] Track requestsMade and placesFound
  - [x] Calculate estimated cost

- [x] **Task 4:** Connect to exploration start
  - [x] Listen for exploration:started event
  - [x] Process all tiles via Promise.allSettled
  - [x] Initialize tile fetcher in main.ts

- [x] **Task 5:** Dispatch tile completion events
  - [x] tile:completed event with places found
  - [x] tile:failed event with error message
  - [x] exploration:completed when all tiles done

## Dev Notes

**Architecture Requirements:**
- Queue module already exists with 5 concurrent, 3 retries, exponential backoff
- Use Mapbox Search API v1 (category search)
- Events: tile:completed, tile:failed, exploration:completed

**API Details:**
- Mapbox Category Search endpoint: /search/searchbox/v1/category/{category}
- 25 results per request limit
- Use tile center for proximity, tile bounds for bbox

**Previous Learnings from Story 4.1:**
- Exploration record and tiles already created
- Stats in exploration track progress
- UI listens for state changes

## Dev Agent Record

### Implementation Plan
1. Created category-search.ts with fetchPlacesByCategory()
2. Uses existing queue.ts for rate limiting (5 concurrent, 3 retries)
3. Added mapSearchFeatureToPlace() for data transformation
4. Created tile-fetcher.ts with:
   - initializeTileFetcher() to listen for exploration:started
   - processTiles() to process all tiles concurrently
   - processSingleTile() to fetch and update individual tiles
   - updateExplorationStats() for incremental stat updates
   - checkExplorationComplete() to finalize exploration
5. Added to store.ts:
   - updateTileStatus() to update individual tile status
   - addPlaces() to add places with deduplication
   - getPlaces() to retrieve places by region
6. Initialized tile fetcher in main.ts

### Debug Log
- Build passed without errors

### Completion Notes
- Queue limits to 5 concurrent requests (AC1)
- All tiles queued via enqueue() with rate limiting (AC2)
- Queue has exponential backoff retry (3 retries) (AC3)
- Promise.allSettled allows concurrent processing without blocking (AC4)
- Tile status transitions: pending → fetching → complete/failed
- Stats update incrementally: tilesCompleted, tilesFailed, placesFound, requestsMade
- Estimated cost calculated: $5 per 1000 requests after 100k free tier
- Events dispatched: tile:completed, tile:failed, exploration:completed
- Places deduplicated by mapboxId when added

## File List

| File | Action |
|------|--------|
| src/api/category-search.ts | Created - Mapbox category search API |
| src/exploration/tile-fetcher.ts | Created - tile processing engine |
| src/state/store.ts | Modified - added updateTileStatus(), addPlaces(), getPlaces() |
| src/main.ts | Modified - added initializeTileFetcher() |

## Change Log

| Date | Change |
|------|--------|
| 2026-01-18 | Story created for implementation |
| 2026-01-18 | Completed all tasks - concurrent tile fetching with queue |

