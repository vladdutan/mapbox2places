# Story 4.3: Store Fetched POIs

## Story

As a **user**,
I want **fetched POIs to be stored immediately as they arrive**,
So that **no data is lost during exploration** (FR12).

## Status

review

## Acceptance Criteria

- [x] **AC1:** Given a tile fetch completes successfully, when POIs are returned from the API, then POIs are stored in application state
- [x] **AC2:** Duplicate POIs (same mapboxId) are handled appropriately
- [x] **AC3:** A `place:fetched` event is dispatched
- [x] **AC4:** A `tile:completed` event is dispatched

## Tasks/Subtasks

- [x] **Task 1:** Store POIs in application state
  - [x] addPlaces() function stores places by regionId
  - [x] Places stored immediately after API response

- [x] **Task 2:** Handle duplicate POIs
  - [x] Filter duplicates by mapboxId in addPlaces()
  - [x] Only unique places added to state

- [x] **Task 3:** Dispatch place:fetched event
  - [x] Import PlaceFetchedPayload type
  - [x] Dispatch event with explorationId, tileId, places

- [x] **Task 4:** Verify tile:completed event
  - [x] Event dispatched after successful tile fetch
  - [x] Includes explorationId, tileId, placesFound

## Dev Notes

**Architecture Requirements:**
- Places stored in Map<string, Place[]> keyed by regionId
- Events follow category:action pattern
- Deduplication by mapboxId

**Previous Learnings from Story 4.2:**
- addPlaces() already implements deduplication
- tile:completed event already dispatched
- Only place:fetched event was missing

## Dev Agent Record

### Implementation Plan
Most functionality was implemented in Story 4.2:
1. addPlaces() stores places with deduplication (implemented in 4.2)
2. tile:completed event dispatched (implemented in 4.2)
3. Added place:fetched event dispatch in tile-fetcher.ts

### Debug Log
- Build passed without errors

### Completion Notes
- POIs stored via addPlaces(regionId, places) immediately after fetch (AC1)
- Deduplication filters out places with existing mapboxId (AC2)
- place:fetched event dispatched with places array (AC3)
- tile:completed event dispatched with placesFound count (AC4)
- Events only dispatched when places.length > 0

## File List

| File | Action |
|------|--------|
| src/exploration/tile-fetcher.ts | Modified - added place:fetched event dispatch |

## Change Log

| Date | Change |
|------|--------|
| 2026-01-18 | Story created for implementation |
| 2026-01-18 | Added place:fetched event - most functionality from Story 4.2 |

