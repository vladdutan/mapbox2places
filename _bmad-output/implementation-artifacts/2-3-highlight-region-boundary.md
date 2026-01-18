# Story 2.3: Highlight Region Boundary

## Story

As a **user**,
I want **to see the selected region highlighted on the map**,
So that **I can visually confirm the exploration area**.

## Status

review

## Acceptance Criteria

- [x] **AC1:** Given a region is selected, when the map displays the region, then the region boundary is visually highlighted (polygon or bounding box)
- [x] **AC2:** The highlight is clearly visible but doesn't obscure the map
- [x] **AC3:** The region name is displayed in the UI

## Tasks/Subtasks

- [x] **Task 1:** Create region layer module
  - [x] Create `src/map/region-layer.ts` for region visualization
  - [x] Add GeoJSON source for region bounds
  - [x] Add fill and line layers for boundary

- [x] **Task 2:** Draw region boundary on selection
  - [x] Listen for `region:selected` event
  - [x] Convert region bounds to GeoJSON polygon
  - [x] Update map layer with region geometry
  - [x] Style with semi-transparent fill and solid border

- [x] **Task 3:** Display region name in stats panel
  - [x] Create `src/ui/stats-panel.ts` for stats panel management
  - [x] Update stats panel to show current region name
  - [x] Show region info when selected
  - [x] Clear when no region selected

- [x] **Task 4:** Handle region changes
  - [x] Update boundary when region changes
  - [x] Clear boundary when region deselected

## Dev Notes

**Architecture Requirements:**
- Map layers go in `src/map/` directory
- Use Mapbox GL layer system for rendering
- Listen for state change events

**Styling:**
- Fill: semi-transparent blue (rgba)
- Border: solid blue line, 2px width
- Should not obscure map features

**Previous Learnings from Story 2.2:**
- Region created with bounds from geocoding
- `region:selected` event contains region and feature

## Dev Agent Record

### Implementation Plan
1. Created region-layer.ts with Mapbox GL source and layers
2. GeoJSON source holds region polygon geometry
3. Fill layer with 10% blue opacity
4. Line layer with 80% blue opacity, 2px width
5. Event listeners for region:selected and state:changed
6. Created stats-panel.ts to show region name and placeholder stats
7. Integrated both into main.ts after map initialization

### Debug Log
- Fixed unused import error (MapboxMap type)
- Fixed mapboxgl namespace import to use type import for GeoJSONSource

### Completion Notes
- Region boundary drawn as bounding box polygon on map
- Fill: rgba(59, 130, 246, 0.1) - light blue, doesn't obscure map
- Border: rgba(59, 130, 246, 0.8), 2px width - clearly visible
- Stats panel shows current region name in styled card
- Placeholder stats grid (tiles, places, requests, cost) for future use
- Boundary updates when region changes, clears when deselected

## File List

| File | Action |
|------|--------|
| src/map/region-layer.ts | Created - region boundary visualization |
| src/ui/stats-panel.ts | Created - stats panel management |
| src/main.ts | Modified - added region layer and stats panel init |

## Change Log

| Date | Change |
|------|--------|
| 2026-01-18 | Story created for implementation |
| 2026-01-18 | Completed all tasks - region boundary highlight and name display |
