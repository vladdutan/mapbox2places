# Story 3.1: Display Default Tile Configuration

## Story

As a **user**,
I want **to see the default tile size when a region is selected**,
So that **I understand how the region will be divided for exploration** (FR5).

## Status

review

## Acceptance Criteria

- [x] **AC1:** Given a region is selected, when the configuration panel is displayed, then the default tile size (500m × 500m) is shown
- [x] **AC2:** The tile size is displayed in a clear, readable format

## Tasks/Subtasks

- [x] **Task 1:** Add exploration config section to stats panel
  - [x] Replace "No active exploration" placeholder with config UI
  - [x] Show when a region is selected
  - [x] Include tile size display

- [x] **Task 2:** Display default tile size
  - [x] Show "500m × 500m" as default tile size
  - [x] Use clear label and formatting
  - [x] Style consistently with stats panel

- [x] **Task 3:** Show estimated tile count
  - [x] Use tile-calculator.estimateTileCount() for current region
  - [x] Display tile count based on region bounds and tile size
  - [x] Update when region changes

## Dev Notes

**Architecture Requirements:**
- tile-calculator already has estimateTileCount() function
- Default tile size is 500m (defined in tile-calculator)
- Config should be part of stats panel UI

**UI Design:**
- Clear section header: "Exploration Config" or similar
- Tile size displayed prominently
- Tile count estimate shown below

**Previous Learnings from Story 2.4:**
- Stats panel renders based on state:changed events
- Current region available via getCurrentRegion()

## Dev Agent Record

### Implementation Plan
1. Added import for estimateTileCount from tile-calculator
2. Added DEFAULT_TILE_SIZE constant (500m)
3. Replaced "Exploration Status" section with "Configuration" section
4. Display tile size as "500m × 500m"
5. Calculate and display estimated tile count using estimateTileCount()
6. Tile count uses toLocaleString() for number formatting

### Debug Log
- Build passed without errors

### Completion Notes
- Configuration section shows when a region is selected
- Tile Size: "500m × 500m" displayed clearly
- Est. Tiles: calculated dynamically based on region bounds
- Tile count formatted with locale-specific number separators
- Info text indicates tile size adjustment coming in next stories
- Tile count updates automatically when region changes (via state:changed)

## File List

| File | Action |
|------|--------|
| src/ui/stats-panel.ts | Modified - added config section with tile size and count |

## Change Log

| Date | Change |
|------|--------|
| 2026-01-18 | Story created for implementation |
| 2026-01-18 | Completed all tasks - default tile config display with tile count |
