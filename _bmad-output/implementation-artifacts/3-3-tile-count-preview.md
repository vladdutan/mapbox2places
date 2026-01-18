# Story 3.3: Tile Count Preview

## Story

As a **user**,
I want **to see how many tiles the selected region will be divided into**,
So that **I can estimate the number of API requests before starting** (FR7, FR8).

## Status

review

## Acceptance Criteria

- [x] **AC1:** Given a region is selected and tile size is set, when the tile count is calculated, then the total tile count is displayed in real-time
- [x] **AC2:** Changing tile size immediately updates the count
- [x] **AC3:** The calculation uses the tile-calculator module per architecture

## Tasks/Subtasks

- [x] **Task 1:** Display tile count for selected region
  - [x] Use estimateTileCount() from tile-calculator
  - [x] Show count in configuration panel
  - [x] Format with locale-specific number separators

- [x] **Task 2:** Update count when tile size changes
  - [x] Recalculate on tile size selection change
  - [x] Update display immediately

## Dev Notes

**Architecture Requirements:**
- Use tile-calculator module for calculations
- Event-driven updates via state:changed

**Previous Learnings:**
- Story 3.1 implemented initial tile count display
- Story 3.2 implemented tile size selection with count updates
- This story validates the combined functionality

## Dev Agent Record

### Implementation Plan
This story's acceptance criteria were already satisfied by the implementations in Stories 3.1 and 3.2:

**From Story 3.1:**
- Added estimateTileCount() usage in renderCurrentRegionInfo()
- Display shows "Est. Tiles: X" with toLocaleString() formatting

**From Story 3.2:**
- Added tile size dropdown with state management
- Stats panel re-renders on 'config' state changes
- Tile count recalculates using selected tile size

### Debug Log
- No additional code changes required
- Verified existing implementation satisfies all ACs

### Completion Notes
- Tile count displays in real-time when region is selected (AC1)
- Changing tile size immediately updates count via state:changed event (AC2)
- Uses estimateTileCount() from src/exploration/tile-calculator.ts (AC3)
- Implementation location: src/ui/stats-panel.ts:128-162

## File List

| File | Action |
|------|--------|
| src/ui/stats-panel.ts | No changes - already implements all ACs |
| src/exploration/tile-calculator.ts | No changes - estimateTileCount() already exists |

## Change Log

| Date | Change |
|------|--------|
| 2026-01-18 | Story created - ACs already satisfied by Stories 3.1 and 3.2 |

