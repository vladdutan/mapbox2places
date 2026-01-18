# Story 2.4: Multi-Region Support

## Story

As a **user**,
I want **to have multiple regions active simultaneously**,
So that **I can compare or explore different areas in one session** (FR4).

## Status

review

## Acceptance Criteria

- [x] **AC1:** Given a region is already selected, when the user searches and selects another region, then both regions remain in the system
- [x] **AC2:** The user can see a list of active regions
- [x] **AC3:** The user can switch between regions
- [x] **AC4:** Each region maintains its own state

## Tasks/Subtasks

- [x] **Task 1:** Display region list in stats panel
  - [x] Show all active regions in a list
  - [x] Highlight the currently selected region
  - [x] Display region count

- [x] **Task 2:** Implement region switching
  - [x] Add click handler to switch current region
  - [x] Update map view when switching regions
  - [x] Update boundary display for new region

- [x] **Task 3:** Add region management actions
  - [x] Add remove button for each region
  - [x] Clear region from state and map when removed
  - [x] Handle removing the current region (auto-switch to first remaining)

- [x] **Task 4:** Maintain state integrity
  - [x] Ensure regions array preserves all regions
  - [x] Current region ID switches between regions
  - [x] Each region keeps its bounds independently

## Dev Notes

**Architecture Requirements:**
- State already supports regions array and currentRegionId
- Use store functions: addRegion(), setCurrentRegion(), getState()
- Dispatch events for region changes

**UI Design:**
- Region list in stats panel above current region info
- Each item shows region name (truncated if long)
- Selected region has visual indicator
- Remove button (X) on each region

**Previous Learnings from Story 2.3:**
- Region boundary layer already handles state:changed events
- Stats panel already shows current region name

## Dev Agent Record

### Implementation Plan
1. Added removeRegion() and getRegions() to store.ts
2. removeRegion auto-switches to first remaining region if current is removed
3. Rewrote stats-panel.ts to show regions list
4. Each region item: short name, blue highlight if selected, X remove button
5. Click region name to switch, click X to remove
6. Switching region zooms map to that region's bounds
7. Region boundary layer already handles state:changed events

### Debug Log
- Build passed without errors

### Completion Notes
- Regions list shows count and all active regions
- Selected region highlighted with blue background/border
- Non-selected regions have gray background with hover state
- Region names truncated to first part (before comma) for compact display
- Full name shown on hover tooltip
- Clicking region name switches to that region and zooms map
- X button removes region (with hover state showing red)
- Removing current region auto-switches to first remaining
- Removing last region shows empty state
- Each region maintains independent bounds and state

## File List

| File | Action |
|------|--------|
| src/state/store.ts | Modified - added removeRegion(), getRegions() |
| src/ui/stats-panel.ts | Modified - rewrote for multi-region support |

## Change Log

| Date | Change |
|------|--------|
| 2026-01-18 | Story created for implementation |
| 2026-01-18 | Completed all tasks - multi-region list with switching and removal |
