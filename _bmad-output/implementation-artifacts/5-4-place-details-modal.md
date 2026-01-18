# Story 5.4: Place Details Modal

## Story

As a **user**,
I want **to see a modal with place information**,
So that **I can view name, address, and category of a POI** (FR17).

## Status

review

## Acceptance Criteria

- [x] **AC1:** Given a marker is clicked, when the details modal opens, then the modal displays the place name
- [x] **AC2:** The modal displays the address (if available)
- [x] **AC3:** The modal displays the category
- [x] **AC4:** The modal is visually styled per Tailwind architecture
- [x] **AC5:** Modal opens within 200ms (NFR3) - slide-up animation is 200ms

## Tasks/Subtasks

- [x] **Task 1:** Create place details modal module
  - [x] Create place-modal.ts in src/ui/
  - [x] Create modal container dynamically
  - [x] Export showPlaceModal() and closePlaceModal()

- [x] **Task 2:** Listen for place:selected events
  - [x] Subscribe to place:selected CustomEvent
  - [x] Extract place from event detail
  - [x] Call showPlaceModal() with place data

- [x] **Task 3:** Display place information
  - [x] Place name in header
  - [x] Category as badge
  - [x] Address section (with fallback for unavailable)
  - [x] Coordinates in lat/lng format
  - [x] Mapbox ID for reference

- [x] **Task 4:** Style with Tailwind CSS
  - [x] Modal backdrop with black/50 overlay
  - [x] White rounded modal panel
  - [x] Shadow and border styling
  - [x] Responsive: bottom sheet on mobile, centered on desktop

- [x] **Task 5:** Add slide-up animation
  - [x] CSS keyframes animation in style.css
  - [x] 200ms duration for NFR3 compliance
  - [x] animate-slide-up class

- [x] **Task 6:** Initialize modal in main.ts
  - [x] Import initializePlaceModal
  - [x] Call before map initialization

## Dev Notes

**Architecture Requirements:**
- Modal styled with Tailwind CSS per architecture
- Accessible: role="dialog", aria-modal, aria-labelledby
- Mobile-first responsive design

**Design Decisions:**
- Bottom sheet on mobile, centered on desktop
- Blue category badge for visual hierarchy
- Fallback text for missing address
- Coordinates shown as lat, lng (standard format)
- Escape key closes modal

**Previous Learnings from Story 5.3:**
- place:selected event contains full Place object
- Place has name, category, coordinates, metadata

## Dev Agent Record

### Implementation Plan
1. Created place-modal.ts with modal rendering
2. Modal container added dynamically to body
3. Listens for place:selected events
4. Renders name, category badge, address, coordinates, mapboxId
5. Added slide-up animation to style.css
6. Initialized modal in main.ts

### Debug Log
- Build passed without errors

### Completion Notes
- Place name displayed in header (AC1)
- Address shown with fallback for unavailable (AC2)
- Category shown as blue badge (AC3)
- Tailwind CSS styling throughout (AC4)
- 200ms slide-up animation meets NFR3 (AC5)
- Close via: X button, backdrop click, Escape key
- Accessible with ARIA attributes

## File List

| File | Action |
|------|--------|
| src/ui/place-modal.ts | Created - place details modal component |
| src/style.css | Modified - added slide-up animation |
| src/main.ts | Modified - added modal initialization |

## Change Log

| Date | Change |
|------|--------|
| 2026-01-18 | Story created for implementation |
| 2026-01-18 | Completed all tasks - place details modal with animations |
