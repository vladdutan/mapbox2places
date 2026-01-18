# Story 4.7: Per-Region Statistics

## Story

As a **user**,
I want **to see statistics specific to each region**,
So that **I can compare exploration results across regions** (FR23).

## Status

review

## Acceptance Criteria

- [x] **AC1:** Given multiple regions have explorations, when viewing the stats dashboard, then stats are shown for the currently selected region
- [x] **AC2:** Switching regions updates the displayed stats
- [x] **AC3:** Each region's stats are independent

## Tasks/Subtasks

- [x] **Task 1:** Add getExplorationByRegion() function
  - [x] Add function to store.ts
  - [x] Returns exploration matching regionId

- [x] **Task 2:** Update region switching to set exploration
  - [x] Import getExplorationByRegion and setCurrentExploration
  - [x] In switchToRegion(), find exploration for region
  - [x] Set current exploration (or null if none exists)

- [x] **Task 3:** Verify stats display correctly
  - [x] Stats panel checks currentExploration.regionId === region.id
  - [x] Shows exploration status or completion for matching region
  - [x] Shows config panel if no exploration for region

## Dev Notes

**Architecture Requirements:**
- Explorations stored with regionId reference
- Each region can have one exploration
- Stats panel shows exploration matching current region

**Previous Learnings from Stories 4.4-4.6:**
- renderExplorationStatus() shows running exploration stats
- renderExplorationComplete() shows completed exploration stats
- Both check currentExploration.regionId === region.id

## Dev Agent Record

### Implementation Plan
1. Added getExplorationByRegion(regionId) to store.ts
2. Updated switchToRegion() in stats-panel.ts to:
   - Find exploration for the new region
   - Set it as current exploration (or null if none)
3. Verified stats panel already checks region match

### Debug Log
- Build passed without errors

### Completion Notes
- getExplorationByRegion() returns exploration for a given regionId (AC1)
- switchToRegion() now sets currentExploration when switching (AC2)
- Each region has its own exploration with independent stats (AC3)
- Explorations stored separately, keyed by their own ID with regionId reference
- Places stored in Map keyed by regionId for per-region data

## File List

| File | Action |
|------|--------|
| src/state/store.ts | Modified - added getExplorationByRegion() function |
| src/ui/stats-panel.ts | Modified - import new functions, update switchToRegion() |

## Change Log

| Date | Change |
|------|--------|
| 2026-01-18 | Story created for implementation |
| 2026-01-18 | Completed all tasks - per-region exploration switching |
