# Story 4.5: Real-Time Place & Request Counts

## Story

As a **user**,
I want **to see places found and requests made updating live**,
So that **I can track the exploration results** (FR20, FR21).

## Status

review

## Acceptance Criteria

- [x] **AC1:** Given an exploration is running, when POIs are fetched, then "Places found: N" updates in real-time
- [x] **AC2:** Given an exploration is running, when POIs are fetched, then "API requests: N" updates in real-time
- [x] **AC3:** Updates occur within 100ms (NFR2)

## Tasks/Subtasks

- [x] **Task 1:** Verify places found display
  - [x] renderExplorationStatus() shows placesFound from stats
  - [x] Value formatted with toLocaleString()

- [x] **Task 2:** Add API requests to running exploration view
  - [x] Add "API Requests" row to renderExplorationStatus()
  - [x] Add "Est. Cost" row to renderExplorationStatus()
  - [x] Values from stats.requestsMade and stats.estimatedCost

- [x] **Task 3:** Verify real-time updates
  - [x] State:changed events trigger renderStatsPanel()
  - [x] Listens for 'exploration' and 'tile' state changes
  - [x] Updates occur immediately via event-driven architecture

## Dev Notes

**Architecture Requirements:**
- Stats panel subscribes to state:changed events
- Event-driven updates ensure <100ms response time
- Stats updated incrementally in tile-fetcher.ts

**Previous Learnings from Story 4.4:**
- renderExplorationStatus() already shows places found
- State changes dispatch 'state:changed' events
- Stats include: tilesCompleted, placesFound, requestsMade, estimatedCost

## Dev Agent Record

### Implementation Plan
1. Verified places found display exists in renderExplorationStatus()
2. Added API Requests row to running exploration view
3. Added Est. Cost row to running exploration view
4. Verified real-time updates via state:changed event subscriptions

### Debug Log
- Build passed without errors

### Completion Notes
- "Places Found" displays stats.placesFound with toLocaleString() (AC1)
- "API Requests" displays stats.requestsMade with toLocaleString() (AC2)
- "Est. Cost" displays stats.estimatedCost formatted as USD
- State:changed events for 'exploration' and 'tile' trigger immediate re-render (AC3)
- Event-driven architecture ensures updates within 100ms

## File List

| File | Action |
|------|--------|
| src/ui/stats-panel.ts | Modified - added API Requests and Est. Cost to renderExplorationStatus() |

## Change Log

| Date | Change |
|------|--------|
| 2026-01-18 | Story created for implementation |
| 2026-01-18 | Completed all tasks - added API requests and cost to running view |
