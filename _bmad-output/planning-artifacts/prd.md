---
stepsCompleted: ['step-01-init', 'step-02-discovery', 'step-03-success', 'step-04-journeys', 'step-05-domain', 'step-06-innovation', 'step-07-project-type', 'step-08-scoping', 'step-09-functional', 'step-10-nonfunctional', 'step-11-polish', 'step-12-complete']
inputDocuments: []
documentCounts:
  briefs: 0
  research: 0
  brainstorming: 0
  projectDocs: 0
workflowType: 'prd'
classification:
  projectType: 'web_app'
  domain: 'general'
  complexity: 'low'
  projectContext: 'greenfield'
---

# Product Requirements Document - map2places

**Author:** Victor
**Date:** 2026-01-18

## Executive Summary

**map2places** is a browser-based utility tool for exploring Mapbox API costs. It allows users to select a geographic region, break it into tiles, and fetch Points of Interest (POIs) via Mapbox's Category Search API. The app provides real-time visibility into tile progress, places found, and estimated API costs—answering the question: "How much would it cost to fetch all POIs of type X in region Y?"

**Key Value:** Cost transparency for Mapbox API usage through hands-on exploration.

**Technical Approach:** Client-side SPA with no backend, using Mapbox GL JS for mapping and IndexedDB for local persistence.

## Success Criteria

### User Success

- **Real-time visibility**: Map markers and stats update live as each tile completes - no waiting for "all done"
- **Cost clarity**: At any point, user knows exactly how many API requests have been made and the estimated cost
- **Multi-region workflow**: Can explore multiple regions simultaneously (e.g., Bucharest + Cluj) with distinct stats per region
- **Exploration satisfaction**: Tap any marker → details modal appears instantly
- **Session persistence**: Close browser, come back later, previous explorations are intact

### Business Success

- **Personal utility tool** - no commercial metrics
- **"Done" for v1**: Works reliably for multiple categories across multiple regions with accurate cost tracking

### Technical Success

| Criteria | Target |
|----------|--------|
| Real-time updates | Map + stats update within ~1s of each tile completing |
| Concurrent fetching | Multiple tiles fetched in parallel (reasonable rate limit to avoid API throttling) |
| No data loss | Every fetched place stored in local cache and rendered |
| Responsive UI | No freezing during bulk processing |
| Accurate cost calculation | Matches Mapbox pricing (100k free, then per-request pricing) |
| Browser support | Modern browsers (Chrome, Firefox, Safari, Edge - latest versions) |
| Offline viewing | Previously fetched data viewable without network |

### Measurable Outcomes

- App can process a city-sized region (e.g., Bucharest ~228 km²) without crashing
- Stats are accurate: tiles counted = tiles processed, places counted = places on map
- Cost estimate within 5% of actual Mapbox billing

## User Journeys

**Primary User: Victor - POI Cost Explorer**

### Journey 1: First Exploration (Happy Path)

**Opening Scene:**
Victor wants to understand how much it would cost to fetch all grocery stores in Bucharest via Mapbox API. He opens map2places in his browser.

**Rising Action:**
1. Types "Bucharest" in the search bar → map zooms and highlights the city boundary
2. Selects POI category: "grocery"
3. Adjusts tile size if needed (keeps default 500m × 500m)
4. Clicks "Start Exploration"
5. Watches the dashboard come alive:
   - Tiles: 0/1,824 → 50/1,824 → ...
   - Places found: 0 → 47 → 156 → ...
   - API requests: 0 → 50 → ...
   - Est. cost: $0.00 → $0.02 → ...
6. Map fills with clustered markers as tiles complete
7. Taps a marker cluster → zooms in → taps individual marker → sees details modal (name, address, category)

**Climax:**
Exploration completes. Dashboard shows: 1,824 tiles processed, 2,847 grocery stores found, 1,824 API requests, estimated cost: $0.91 (within free tier).

**Resolution:**
Victor now knows: "Fetching all groceries in Bucharest costs ~1,800 requests. I'm well within the 100k free tier." He closes the browser, satisfied.

### Journey 2: Returning User (Session Persistence)

**Opening Scene:**
Next day, Victor returns to check his Bucharest exploration and start a new one for Cluj.

**Rising Action:**
1. Opens map2places → previous Bucharest data loads from cache
2. Map shows all 2,847 grocery markers from yesterday
3. Stats dashboard shows completed exploration summary
4. Clicks "New Region" → types "Cluj-Napoca"
5. Starts new exploration while Bucharest data remains visible/accessible

**Climax:**
Both regions now explored. Per-region stats show the breakdown. Victor can switch between them.

**Resolution:**
Victor compares: "Bucharest: 2,847 groceries in 1,824 requests. Cluj: 412 groceries in 287 requests." Data persists for future reference.

### Journey 3: Large Region Exploration (Edge Case)

**Opening Scene:**
Victor gets ambitious - wants to explore all of Romania for "stores."

**Rising Action:**
1. Types "Romania" → map highlights the entire country
2. Sees tile count estimate: ~950,000 tiles at 500m × 500m
3. Realizes this is massive - adjusts tile size to 2km × 2km
4. New estimate: ~59,000 tiles - more manageable
5. Starts exploration, knowing it will take time
6. Concurrent fetching keeps progress steady
7. Can close browser and return later - progress persists

**Climax:**
After running over several sessions, exploration completes. 47,000+ stores found across Romania.

**Resolution:**
Victor has country-wide POI data and knows the API cost for national-scale exploration. Decides whether this is feasible for his use case.

### Journey Requirements Summary

| Journey | Capabilities Revealed |
|---------|----------------------|
| First Exploration | Search, tile calculation, concurrent fetching, real-time stats, map markers, clustering, details modal |
| Returning User | Local persistence, session restoration, multi-region support, region switching |
| Large Region | Configurable tile size, tile count preview, long-running exploration support, pause/resume (growth feature) |

## Web App Specific Requirements

### Project-Type Overview

map2places is a **single-page application (SPA)** that runs entirely in the browser with no backend server. All data persistence is handled through browser local storage (localStorage/IndexedDB). The app integrates with Mapbox APIs for mapping and POI search functionality.

### Technical Architecture Considerations

**Application Type:** Client-side SPA
- No server component required
- All logic runs in browser JavaScript
- API calls made directly to Mapbox from client
- State managed in-memory and persisted to local storage

**Data Flow:**
1. User input → Geocoding API (region selection)
2. Tile calculation → Category Search API (per tile)
3. Results → Local cache + Map rendering
4. Stats aggregation → Dashboard display

### Browser Support

| Browser | Version | Priority |
|---------|---------|----------|
| Chrome | Latest | Primary |
| Firefox | Latest | Primary |
| Safari | Latest | Secondary |
| Edge | Latest | Secondary |

**Note:** No legacy browser support required. Modern ES6+ features can be used freely.

### Responsive Design

**Desktop-only** - No mobile/tablet optimization required.

- Minimum viewport: 1280px width assumed
- Fixed layout acceptable
- No touch gesture optimization needed

### Performance Targets

| Metric | Target |
|--------|--------|
| Initial load | < 3 seconds |
| Map interaction | 60fps panning/zooming |
| Tile fetch → render | < 1 second per tile batch |
| Stats update | Real-time (< 100ms after data arrives) |
| Local storage ops | < 50ms |

### SEO Strategy

**Not applicable** - Personal utility tool, no public discoverability needed.

### Accessibility Level

**Not applicable** - Personal use only, no accessibility compliance required.

### Implementation Considerations

**Key Libraries/Dependencies:**
- Mapbox GL JS - Map rendering and interaction
- Mapbox Search SDK or direct API calls - POI fetching
- Supercluster or Mapbox built-in clustering - Marker clustering
- IndexedDB (or localStorage) - Data persistence

**API Integration:**
- Mapbox Geocoding API - Region search
- Mapbox Category Search API - POI fetching (25 results/request limit)
- Client-side rate limiting to avoid API throttling

**State Management:**
- In-memory state for active explorations
- Persistent state in IndexedDB for cross-session data
- Per-region state isolation

## Project Scoping & Phased Development

### MVP Strategy & Philosophy

**MVP Approach:** Problem-Solving MVP
- Solve the core problem completely: "What does it cost to fetch POIs for this region?"
- Every feature serves the primary value proposition
- No unnecessary polish, but fully functional

**Resource Requirements:** Solo developer project
- Single developer can build and maintain
- No backend infrastructure needed
- Mapbox account with API token (free tier sufficient for development)

### MVP Feature Set (Phase 1)

**Core User Journeys Supported:**
- Journey 1: First Exploration (complete)
- Journey 2: Returning User (complete)
- Journey 3: Large Region (partial - no pause/resume)

**Must-Have Capabilities:**
1. Region search via Mapbox Geocoding
2. Configurable tile size (default 500m × 500m)
3. Tile grid calculation with count preview
4. Concurrent tile fetching with rate limiting
5. Real-time stats dashboard (tiles, places, requests, cost)
6. Clustered map markers
7. Place details modal on tap
8. Local storage persistence (IndexedDB)
9. Multi-region support with per-region stats

### Post-MVP Features

**Phase 2 (Growth):**
- Multiple POI categories per region
- Aggregate stats across all regions
- Export data (CSV/JSON)
- Pause/resume fetching
- Visual tile grid overlay

**Phase 3 (Vision):**
- Side-by-side region comparison
- Historical tracking
- Shareable results via URL

### Risk Mitigation Strategy

**Technical Risks:**
- *Mapbox API rate limiting* → Implement client-side rate limiting (e.g., 5 concurrent requests)
- *Large region performance* → Test with city-scale data early; IndexedDB handles large datasets well

**Market Risks:**
- None - personal utility tool

**Resource Risks:**
- Solo project → Keep scope tight, ship incrementally

## Functional Requirements

### Region Selection & Search

- **FR1:** User can search for a geographic region by name (country, city, district)
- **FR2:** User can see the map zoom and highlight the selected region boundary
- **FR3:** User can start a new exploration for a selected region
- **FR4:** User can have multiple regions active simultaneously

### Tile Configuration

- **FR5:** User can view the default tile size (500m × 500m)
- **FR6:** User can adjust the tile size before starting an exploration
- **FR7:** User can see a preview of total tile count for the selected region and tile size
- **FR8:** System calculates tile grid based on region boundary and tile size

### POI Discovery

- **FR9:** User can select a POI category to search for (e.g., grocery, stores)
- **FR10:** User can start the exploration to fetch POIs across all tiles
- **FR11:** System fetches POIs from multiple tiles concurrently with rate limiting
- **FR12:** System stores all fetched POIs in local cache as they arrive

### Map Visualization

- **FR13:** User can see POI markers appear on the map as tiles complete
- **FR14:** User can see markers clustered when zoomed out
- **FR15:** User can zoom in to see individual markers
- **FR16:** User can tap/click a marker to view place details
- **FR17:** User can see a modal with place information (name, address, category)
- **FR18:** User can close the details modal

### Statistics & Cost Tracking

- **FR19:** User can see real-time tile progress (completed / total)
- **FR20:** User can see real-time count of places found
- **FR21:** User can see real-time count of API requests made
- **FR22:** User can see real-time estimated cost based on Mapbox pricing
- **FR23:** User can see per-region statistics
- **FR24:** User can see when an exploration is complete

### Data Persistence

- **FR25:** System persists exploration data to local storage automatically
- **FR26:** User can return to the app and see previous explorations restored
- **FR27:** User can view previously fetched POIs on the map without re-fetching
- **FR28:** User can see stats summary for completed explorations

## Non-Functional Requirements

### Performance

- **NFR1:** Map panning and zooming maintains 60fps during exploration
- **NFR2:** Stats dashboard updates within 100ms of new data arriving
- **NFR3:** Place details modal opens within 200ms of tap/click
- **NFR4:** UI remains responsive (no freezing) during concurrent tile fetching
- **NFR5:** Initial app load completes within 3 seconds
- **NFR6:** Local storage operations complete within 50ms

### Integration

- **NFR7:** App implements client-side rate limiting (max 5-10 concurrent Mapbox requests)
- **NFR8:** App handles Mapbox API errors gracefully with user-visible feedback
- **NFR9:** App handles network disconnection without data loss (queued requests can resume)
- **NFR10:** Cost calculation uses current Mapbox pricing (100k free tier, then per-request)

### Data Integrity

- **NFR11:** All fetched POIs are persisted to local storage without data loss
- **NFR12:** Exploration progress can be restored after browser refresh
- **NFR13:** Duplicate POIs (from overlapping tiles) are handled appropriately
