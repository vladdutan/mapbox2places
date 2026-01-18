# Story 5.3: Click Marker for Details

## Story

As a **user**,
I want **to click on a marker to see place details**,
So that **I can learn more about specific POIs** (FR16).

## Status

review

## Acceptance Criteria

- [x] **AC1:** Given POI markers are displayed on the map, when the user clicks on an individual marker, then the place is selected
- [x] **AC2:** A details modal opens within 200ms (NFR3) - event dispatched, modal in Story 5.4
- [x] **AC3:** Given the user clicks on a cluster, when the cluster is clicked, then the map zooms in to show the clustered markers (implemented in Story 5.2)

## Tasks/Subtasks

- [x] **Task 1:** Create PlaceSelectedPayload type
  - [x] Add interface to events.types.ts
  - [x] Include place: Place property
  - [x] Add to AppEventMap

- [x] **Task 2:** Add click handler for individual markers
  - [x] Listen for click on POI_LAYER_ID
  - [x] Query rendered features at click point
  - [x] Reconstruct Place object from feature properties

- [x] **Task 3:** Dispatch place:selected event
  - [x] Create CustomEvent with PlaceSelectedPayload
  - [x] Dispatch on window for global handling

- [x] **Task 4:** Add cursor pointer on marker hover
  - [x] mouseenter changes cursor to pointer
  - [x] mouseleave resets cursor

## Dev Notes

**Architecture Requirements:**
- Events follow category:action pattern (place:selected)
- Event payload contains full Place object
- Modal will listen for this event (Story 5.4)

**Design Decisions:**
- Place reconstructed from GeoJSON feature properties
- tileId and regionId not needed for modal display
- Coordinates taken from feature geometry

**Previous Learnings from Story 5.2:**
- Cluster click zoom already implemented
- Cursor pointer pattern established
- Feature properties stored in GeoJSON

## Dev Agent Record

### Implementation Plan
1. Added PlaceSelectedPayload interface to events.types.ts
2. Added place:selected to AppEventMap
3. Added click handler for POI_LAYER_ID in marker-layer.ts
4. Reconstructs Place from feature properties and geometry
5. Dispatches place:selected event with place data
6. Added mouseenter/mouseleave cursor handlers

### Debug Log
- Build passed without errors

### Completion Notes
- PlaceSelectedPayload type created with place property (AC1)
- place:selected event dispatched on marker click (AC1, AC2)
- Cursor changes to pointer on hover for affordance
- Cluster click zoom implemented in Story 5.2 (AC3)
- Modal will subscribe to place:selected event in Story 5.4

## File List

| File | Action |
|------|--------|
| src/types/events.types.ts | Modified - added PlaceSelectedPayload, updated AppEventMap |
| src/map/marker-layer.ts | Modified - added marker click and hover handlers |

## Change Log

| Date | Change |
|------|--------|
| 2026-01-18 | Story created for implementation |
| 2026-01-18 | Completed all tasks - marker click dispatches place:selected event |
