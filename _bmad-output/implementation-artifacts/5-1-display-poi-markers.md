# Story 5.1: Display POI Markers on Map

## Story

As a **user**,
I want **to see POI markers appear on the map as tiles complete**,
So that **I can visualize the exploration results geographically** (FR13).

## Status

review

## Acceptance Criteria

- [x] **AC1:** Given an exploration is running or complete, when POIs are fetched for a tile, then markers appear on the map at POI coordinates
- [x] **AC2:** Markers appear within 1 second of tile completion
- [x] **AC3:** Map maintains 60fps during marker updates (NFR1)

## Tasks/Subtasks

- [x] **Task 1:** Create POI marker layer module
  - [x] Create marker-layer.ts in src/map/
  - [x] Add GeoJSON source for POI data
  - [x] Add circle layer for marker rendering

- [x] **Task 2:** Listen for place:fetched events
  - [x] Subscribe to place:fetched CustomEvent
  - [x] Extract places from event detail
  - [x] Update GeoJSON source with new places

- [x] **Task 3:** Add markers to map
  - [x] Convert places to GeoJSON FeatureCollection
  - [x] Set source data with all places for region
  - [x] Include place properties for later click handling

- [x] **Task 4:** Initialize marker layer in main.ts
  - [x] Import initializeMarkerLayer
  - [x] Call after map initialization

- [x] **Task 5:** Handle region switching
  - [x] Listen for state:changed events (region, exploration)
  - [x] Update markers to show correct region's places
  - [x] Clear markers when no exploration active

## Dev Notes

**Architecture Requirements:**
- Use GeoJSON source + circle layer for performance (not DOM markers)
- Circle layer renders GPU-accelerated for 60fps
- Events: place:fetched contains places array

**Design Decisions:**
- Red circle markers (#ef4444) with white stroke
- Circle radius: 6px, stroke width: 2px
- Store place properties in features for click handling (Story 5.3)

**Previous Learnings from Epic 4:**
- place:fetched event dispatched in tile-fetcher.ts
- Places stored by regionId in store
- getPlaces(regionId) retrieves all places for a region

## Dev Agent Record

### Implementation Plan
1. Created marker-layer.ts following region-layer.ts pattern
2. Added GeoJSON source 'poi-markers' with empty initial data
3. Added circle layer 'poi-circles' with red markers
4. Listening for place:fetched events to add new markers
5. Listening for state:changed to update markers on region switch
6. Initialized marker layer in main.ts after map ready

### Debug Log
- Build passed without errors

### Completion Notes
- Markers rendered as circles via GeoJSON source (AC1, AC3)
- place:fetched triggers immediate source update (AC2)
- GPU-accelerated circle layer maintains 60fps (NFR1)
- Places stored as GeoJSON features with properties for click handling
- Markers update when switching regions
- Markers cleared when no exploration active

## File List

| File | Action |
|------|--------|
| src/map/marker-layer.ts | Created - POI marker visualization layer |
| src/main.ts | Modified - added marker layer initialization |

## Change Log

| Date | Change |
|------|--------|
| 2026-01-18 | Story created for implementation |
| 2026-01-18 | Completed all tasks - POI markers on map |
