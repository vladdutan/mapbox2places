# Story 4.6: Real-Time Cost Estimation

## Story

As a **user**,
I want **to see estimated API cost updating as requests are made**,
So that **I can monitor spending** (FR22, NFR10).

## Status

review

## Acceptance Criteria

- [x] **AC1:** Given an exploration is running, when API requests are made, then estimated cost is calculated using Mapbox pricing
- [x] **AC2:** Cost accounts for 100k free tier
- [x] **AC3:** Cost displays in USD format (e.g., "$0.00", "$1.23")
- [x] **AC4:** Cost updates in real-time

## Tasks/Subtasks

- [x] **Task 1:** Verify cost calculation logic
  - [x] updateExplorationStats() calculates estimatedCost
  - [x] Uses Mapbox pricing: $5 per 1000 requests after free tier
  - [x] Formula: paidRequests * 0.005

- [x] **Task 2:** Verify 100k free tier handling
  - [x] freeRequests constant set to 100000
  - [x] paidRequests = Math.max(0, requestsMade - freeRequests)
  - [x] Cost is $0.00 until free tier exceeded

- [x] **Task 3:** Verify USD format display
  - [x] Cost displayed as $${estimatedCost.toFixed(2)}
  - [x] Shows in running exploration view
  - [x] Shows in completed exploration view

- [x] **Task 4:** Verify real-time updates
  - [x] Cost recalculated on each tile completion
  - [x] State:changed events trigger UI re-render
  - [x] Updates occur within 100ms via event-driven architecture

## Dev Notes

**Architecture Requirements:**
- Mapbox pricing: 100k free tier, then $5 per 1000 requests
- Cost calculated incrementally in updateExplorationStats()
- USD format with 2 decimal places

**Previous Learnings from Stories 4.2 and 4.5:**
- Cost calculation implemented in tile-fetcher.ts (Story 4.2)
- Cost display added to renderExplorationStatus() (Story 4.5)
- Already shows in both running and completed views

## Dev Agent Record

### Implementation Plan
All functionality was implemented in previous stories:
1. Cost calculation in tile-fetcher.ts updateExplorationStats() (Story 4.2)
2. Cost display in stats-panel.ts renderExplorationStatus() (Story 4.5)
3. Cost display in stats-panel.ts renderExplorationComplete() (Story 4.4)

### Debug Log
- Build passed without errors

### Completion Notes
- Cost calculated: paidRequests = Math.max(0, requestsMade - 100000) (AC1)
- 100k free tier: freeRequests constant, no cost until exceeded (AC2)
- USD format: $${estimatedCost.toFixed(2)} shows "$0.00", "$1.23" etc. (AC3)
- Real-time updates via state:changed events on each tile completion (AC4)
- No new code required - functionality from Stories 4.2, 4.4, 4.5

## File List

| File | Action |
|------|--------|
| src/exploration/tile-fetcher.ts | Previously modified (Story 4.2) - cost calculation |
| src/ui/stats-panel.ts | Previously modified (Stories 4.4, 4.5) - cost display |

## Change Log

| Date | Change |
|------|--------|
| 2026-01-18 | Story created for implementation |
| 2026-01-18 | Verified all ACs met by previous stories - no changes needed |
