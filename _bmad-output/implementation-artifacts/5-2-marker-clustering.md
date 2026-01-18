# Story 5.2: Marker Clustering

## Story

As a **user**,
I want **markers to cluster when zoomed out**,
So that **the map remains readable with many POIs** (FR14).

## Status

review

## Acceptance Criteria

- [x] **AC1:** Given multiple POIs are displayed on the map, when the user is zoomed out, then nearby markers are grouped into clusters
- [x] **AC2:** Clusters show the count of POIs they contain
- [x] **AC3:** Clusters have a distinct visual style from individual markers
- [x] **AC4:** Given the user zooms in, when clusters would contain few markers, then clusters expand to show individual markers (FR15)

## Tasks/Subtasks

- [x] **Task 1:** Enable clustering on GeoJSON source
  - [x] Add cluster: true to source configuration
  - [x] Set clusterRadius: 50 pixels
  - [x] Set clusterMaxZoom: 14

- [x] **Task 2:** Add cluster circle layer
  - [x] Filter for clustered points (has point_count)
  - [x] Scale circle radius based on point count
  - [x] Step expression: 15px (<10), 20px (10+), 25px (50+), 30px (100+)

- [x] **Task 3:** Add cluster count labels
  - [x] Symbol layer with text-field: point_count_abbreviated
  - [x] White text, 12px font size
  - [x] DIN Pro Medium font

- [x] **Task 4:** Style clusters distinctly from markers
  - [x] Clusters: blue (#3b82f6) with white stroke
  - [x] Individual markers: red (#ef4444) with white stroke
  - [x] Filter individual markers with ['!', ['has', 'point_count']]

- [x] **Task 5:** Add cluster click to expand
  - [x] Query features on cluster layer click
  - [x] Get cluster expansion zoom via getClusterExpansionZoom()
  - [x] Ease to cluster center at expansion zoom
  - [x] Change cursor to pointer on cluster hover

## Dev Notes

**Architecture Requirements:**
- Mapbox GL JS built-in clustering via GeoJSON source
- Three layers: clusters, cluster labels, individual markers
- Clusters automatically break apart at clusterMaxZoom

**Design Decisions:**
- Cluster radius: 50px (balance between grouping and detail)
- Max zoom: 14 (urban detail level)
- Blue clusters vs red markers for clear distinction
- Scaled cluster size communicates density

**Previous Learnings from Story 5.1:**
- GeoJSON source already set up
- Circle layer pattern established
- Event listeners for place updates

## Dev Agent Record

### Implementation Plan
1. Updated GeoJSON source with clustering options
2. Added cluster circle layer with stepped radius
3. Added cluster count symbol layer
4. Updated individual marker layer with filter
5. Added cluster click handler for zoom expansion
6. Added cursor change on cluster hover

### Debug Log
- Build passed without errors

### Completion Notes
- Clustering enabled with 50px radius, max zoom 14 (AC1)
- Cluster count shown via point_count_abbreviated (AC2)
- Blue clusters distinct from red markers (AC3)
- Click cluster to zoom and expand (AC4)
- Cursor changes to pointer on cluster hover for affordance

## File List

| File | Action |
|------|--------|
| src/map/marker-layer.ts | Modified - added clustering support and layers |

## Change Log

| Date | Change |
|------|--------|
| 2026-01-18 | Story created for implementation |
| 2026-01-18 | Completed all tasks - marker clustering with click expansion |
