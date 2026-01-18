# Story 2.1: Region Search Input

## Story

As a **user**,
I want **to type a location name in the search bar**,
So that **I can find geographic regions to explore**.

## Status

review

## Acceptance Criteria

- [x] **AC1:** Given the app is loaded, when the user types in the search bar, then the input accepts text (country, city, district names)
- [x] **AC2:** A search can be triggered by pressing Enter or clicking a search button
- [x] **AC3:** Given the user submits a search, when the Mapbox Geocoding API is called, then a loading state is shown during the request
- [x] **AC4:** API errors are handled gracefully with user feedback (NFR8)

## Tasks/Subtasks

- [x] **Task 1:** Enable search input functionality
  - [x] Remove disabled state from search input in layout
  - [x] Add search button with icon
  - [x] Style interactive states (focus, hover)

- [x] **Task 2:** Create Mapbox Geocoding API module
  - [x] Create `src/api/geocoding.ts` for geocoding requests
  - [x] Define geocoding types in `src/types/api.types.ts` (already existed)
  - [x] Implement searchRegions() function using Mapbox Geocoding API

- [x] **Task 3:** Create search functionality
  - [x] Create `src/ui/search.ts` for search logic
  - [x] Wire up Enter key and button click to trigger search
  - [x] Show loading state during API request
  - [x] Dispatch `search:started` and `search:completed` events

- [x] **Task 4:** Implement error handling
  - [x] Handle network errors gracefully
  - [x] Handle API errors (rate limits, invalid responses)
  - [x] Show user-friendly error messages
  - [x] Use error-handler utility with proper categorization

## Dev Notes

**Architecture Requirements:**
- API modules go in `src/api/` directory
- Use the request queue for API calls
- Error categorization: Network, ApiQuota, ApiError
- Event naming: `search:started`, `search:completed`, `search:error`

**Mapbox Geocoding API:**
- Endpoint: https://api.mapbox.com/geocoding/v5/mapbox.places/{query}.json
- Parameters: access_token, types=region,place,locality,district
- Returns: features array with place_name, center, bbox

**Previous Learnings:**
- Layout helper functions available: getSearchInput()
- Store pattern for state updates

## Dev Agent Record

### Implementation Plan
1. Updated layout.ts to enable search input with focus ring styling
2. Added search button next to input
3. Added loading spinner inside input during search
4. Added error message display element in header
5. Created geocoding.ts with searchRegions() function using queue
6. Created search.ts with form submit handling and event dispatching
7. Updated main.ts to initialize search after layout render

### Debug Log
- Build passed without errors
- Geocoding types already existed in api.types.ts

### Completion Notes
- Search input enabled with proper styling (focus ring, hover states)
- Search triggered by form submit (Enter key) or button click
- Loading spinner shown during API request
- Input and button disabled during loading
- Error messages shown in header area
- Custom events dispatched: `search:started`, `search:completed`, `search:error`
- Uses request queue for rate limiting
- Error categorization: Network, ApiQuota, ApiError
- User-friendly error messages for rate limits, token issues, network errors

## File List

| File | Action |
|------|--------|
| src/ui/layout.ts | Modified - enabled search, added loading/error UI |
| src/api/geocoding.ts | Created - geocoding API module |
| src/ui/search.ts | Created - search functionality |
| src/main.ts | Modified - initialize search |

## Change Log

| Date | Change |
|------|--------|
| 2026-01-18 | Story created for implementation |
| 2026-01-18 | Completed all tasks - search input with API integration and error handling |
