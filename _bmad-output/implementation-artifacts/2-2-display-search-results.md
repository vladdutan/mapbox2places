# Story 2.2: Display Search Results & Select Region

## Story

As a **user**,
I want **to see search results and select a region**,
So that **I can choose the exact area I want to explore**.

## Status

review

## Acceptance Criteria

- [x] **AC1:** Given a search returns results, when the results are displayed, then the user sees a list of matching regions with names
- [x] **AC2:** Each result shows the place type (country, city, etc.)
- [x] **AC3:** Given the user clicks a search result, when the region is selected, then the map zooms to fit the region bounds (FR2)
- [x] **AC4:** The region is stored in application state
- [x] **AC5:** The search results close after selection

## Tasks/Subtasks

- [x] **Task 1:** Create search results dropdown UI
  - [x] Add results container below search input
  - [x] Style as dropdown/popover with Tailwind
  - [x] Show/hide based on search state

- [x] **Task 2:** Render search results
  - [x] Display place name for each result
  - [x] Display place type badge (country, city, district, etc.)
  - [x] Add hover states for result items

- [x] **Task 3:** Handle result selection
  - [x] Add click handler for result items
  - [x] Zoom map to region bounds using fitBounds()
  - [x] Close results dropdown after selection

- [x] **Task 4:** Store region in state
  - [x] Create Region from geocoding feature
  - [x] Add region to store via addRegion()
  - [x] Set as current region via setCurrentRegion()
  - [x] Dispatch `region:selected` event

## Dev Notes

**Architecture Requirements:**
- Use store functions: addRegion(), setCurrentRegion()
- Event naming: `region:selected`
- Region type defined in exploration.types.ts

**Map Integration:**
- Use map.fitBounds() with bbox from geocoding result
- If no bbox, use center with appropriate zoom level

**Previous Learnings from Story 2.1:**
- Search results available via getLastSearchResults()
- search:completed event contains results

## Dev Agent Record

### Implementation Plan
1. Added search results dropdown container to layout.ts
2. Added layout helper functions: getSearchResults(), showSearchResults(), renderSearchResults()
3. Added map functions: fitBounds(), flyTo() for zooming to regions
4. Created search-results.ts module with full result handling
5. Results display with place name and colored type badges
6. Click handlers create Region, store it, zoom map, close dropdown
7. Escape key and click outside closes dropdown

### Debug Log
- Build passed without errors

### Completion Notes
- Results dropdown appears below search input with shadow/border styling
- Each result shows full place name with type badge (Country, Region, City, District, Locality)
- Type badges have distinct colors (purple, blue, green, orange, yellow)
- Clicking result: creates Region with UUID, stores in state, zooms map
- Map uses fitBounds() if bbox available, flyTo() otherwise
- Appropriate zoom levels per place type (country:5, city:10, district:12)
- Results close on: selection, Escape key, click outside
- Search input cleared after selection
- `region:selected` event dispatched with region and feature data

## File List

| File | Action |
|------|--------|
| src/ui/layout.ts | Modified - added results dropdown container and helpers |
| src/map/map.ts | Modified - added fitBounds() and flyTo() functions |
| src/ui/search-results.ts | Created - results display and selection handling |
| src/main.ts | Modified - added initializeSearchResults() |

## Change Log

| Date | Change |
|------|--------|
| 2026-01-18 | Story created for implementation |
| 2026-01-18 | Completed all tasks - search results display with region selection and map zoom |
