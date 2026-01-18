# Story 3.4: POI Category Selection

## Story

As a **user**,
I want **to select a POI category to search for**,
So that **I can explore specific types of places** (FR9).

## Status

review

## Acceptance Criteria

- [x] **AC1:** Given the configuration panel is visible, when the user views category options, then a dropdown or list of POI categories is available
- [x] **AC2:** Categories include common types (grocery, stores, restaurants, etc.)
- [x] **AC3:** Given the user selects a category, when the selection is confirmed, then the selected category is stored for the exploration
- [x] **AC4:** The UI displays the selected category

## Tasks/Subtasks

- [x] **Task 1:** Define POI categories
  - [x] Create POI_CATEGORIES constant with common types
  - [x] Include: grocery, restaurant, cafe, bar, pharmacy, bank, gas_station, hotel, parking

- [x] **Task 2:** Add category selection dropdown
  - [x] Add dropdown to configuration panel
  - [x] Show category options with readable labels
  - [x] Style consistently with tile size dropdown

- [x] **Task 3:** Store selected category in state
  - [x] Add selectedCategory to AppState
  - [x] Add getSelectedCategory() and setSelectedCategory() in store
  - [x] Default to first category (grocery)

- [x] **Task 4:** Display selected category
  - [x] Show current selection in dropdown
  - [x] Update on category change

## Dev Notes

**Architecture Requirements:**
- State managed in src/state/store.ts
- Event-driven updates using CustomEvent
- Category will be used by exploration engine (Epic 4)

**UI Design:**
- Category dropdown in Configuration section
- Clear labels for each category
- Similar styling to tile size dropdown

**Previous Learnings from Story 3.2:**
- Dropdown pattern established for tile size
- State change triggers panel re-render

## Dev Agent Record

### Implementation Plan
1. Added selectedCategory to AppState interface
2. Added POI_CATEGORIES constant with 9 categories (grocery, restaurant, cafe, bar, pharmacy, bank, gas_station, hotel, parking)
3. Added DEFAULT_CATEGORY constant ('grocery')
4. Added getSelectedCategory() and setSelectedCategory() functions to store
5. Updated stats-panel.ts to import new functions and constants
6. Added category dropdown above tile size in configuration panel
7. Added attachCategoryListener() function for dropdown change handling

### Debug Log
- Build passed without errors

### Completion Notes
- Category dropdown shows 9 POI types with readable labels
- Selecting a category updates state via setSelectedCategory()
- State change dispatches 'config' event (same as tile size)
- Default category is "Grocery Stores"
- Category dropdown styled consistently with tile size dropdown
- Selected category will be used when starting exploration (Epic 4)

## File List

| File | Action |
|------|--------|
| src/types/state.types.ts | Modified - added selectedCategory to AppState |
| src/state/store.ts | Modified - added POI_CATEGORIES, DEFAULT_CATEGORY, getSelectedCategory(), setSelectedCategory() |
| src/ui/stats-panel.ts | Modified - added category dropdown, attachCategoryListener() |

## Change Log

| Date | Change |
|------|--------|
| 2026-01-18 | Story created for implementation |
| 2026-01-18 | Completed all tasks - POI category selection with 9 categories |

