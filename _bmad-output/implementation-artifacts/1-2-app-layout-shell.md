# Story 1.2: App Layout Shell

## Story

As a **user**,
I want **to see a clean app layout with space for controls and stats**,
So that **I can access search, configuration, and statistics alongside the map**.

## Status

review

## Acceptance Criteria

- [x] **AC1:** Given the app is loaded, when the user views the interface, then a search bar area is visible at the top
- [x] **AC2:** A stats dashboard panel is visible (empty/placeholder state)
- [x] **AC3:** The map fills the remaining viewport
- [x] **AC4:** The layout uses Tailwind CSS styling per architecture

## Tasks/Subtasks

- [x] **Task 1:** Create search bar area
  - [x] Add header/toolbar container at top of page
  - [x] Create placeholder search input element
  - [x] Style with Tailwind CSS (fixed height, proper spacing)

- [x] **Task 2:** Create stats dashboard panel
  - [x] Add stats panel container (sidebar or overlay)
  - [x] Create placeholder stats display area
  - [x] Style with Tailwind CSS for visibility without blocking map

- [x] **Task 3:** Update layout structure
  - [x] Restructure index.html with proper layout containers
  - [x] Ensure map fills remaining viewport after header
  - [x] Update CSS for flexbox/grid layout

- [x] **Task 4:** Create UI components module
  - [x] Create `src/ui/layout.ts` for layout rendering
  - [x] Export render functions for search bar and stats panel

## Dev Notes

**Architecture Requirements:**
- UI components go in `src/ui/` directory
- Use Tailwind CSS for all styling
- Follow kebab-case file naming
- Keep components minimal - just structure for now

**Layout Design:**
- Header: Fixed height (~60px), full width, contains search bar
- Stats Panel: Right sidebar or bottom panel, collapsible in future
- Map: Fills remaining viewport height

**Previous Learnings from Story 1.1:**
- Mapbox map needs explicit container dimensions
- CSS must ensure map container has defined height

## Dev Agent Record

### Implementation Plan
1. Created `src/ui/layout.ts` with renderLayout() function
2. Layout uses flexbox: header (h-14) + main area (flex-1)
3. Main area: map (flex-1) + stats sidebar (w-72)
4. Simplified index.html to just app container
5. Updated main.ts to render layout before map initialization

### Debug Log
- Build passed without errors
- CSS warning about unknown property is false positive from CSS minifier

### Completion Notes
- Header with app title and disabled search input placeholder
- Right sidebar stats panel (w-72) with placeholder state
- Map fills remaining viewport using flexbox
- All styling uses Tailwind CSS classes
- Layout exported helper functions: getMapContainer(), getStatsPanel(), getSearchInput(), updateStatsContent()

## File List

| File | Action |
|------|--------|
| src/ui/layout.ts | Created |
| src/main.ts | Modified |
| index.html | Modified |

## Change Log

| Date | Change |
|------|--------|
| 2026-01-18 | Story created for implementation |
| 2026-01-18 | Completed all tasks - app shell with header, map, and stats sidebar |
