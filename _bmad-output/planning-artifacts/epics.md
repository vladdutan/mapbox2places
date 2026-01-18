---
stepsCompleted: [1, 2, 3, 4]
inputDocuments: ['prd.md', 'architecture.md']
status: 'complete'
totalEpics: 6
totalStories: 26
frsCovered: 28
---

# map2places - Epic Breakdown

## Overview

This document provides the complete epic and story breakdown for map2places, decomposing the requirements from the PRD and Architecture into implementable stories.

## Requirements Inventory

### Functional Requirements

**Region Selection & Search**
- FR1: User can search for a geographic region by name (country, city, district)
- FR2: User can see the map zoom and highlight the selected region boundary
- FR3: User can start a new exploration for a selected region
- FR4: User can have multiple regions active simultaneously

**Tile Configuration**
- FR5: User can view the default tile size (500m × 500m)
- FR6: User can adjust the tile size before starting an exploration
- FR7: User can see a preview of total tile count for the selected region and tile size
- FR8: System calculates tile grid based on region boundary and tile size

**POI Discovery**
- FR9: User can select a POI category to search for (e.g., grocery, stores)
- FR10: User can start the exploration to fetch POIs across all tiles
- FR11: System fetches POIs from multiple tiles concurrently with rate limiting
- FR12: System stores all fetched POIs in local cache as they arrive

**Map Visualization**
- FR13: User can see POI markers appear on the map as tiles complete
- FR14: User can see markers clustered when zoomed out
- FR15: User can zoom in to see individual markers
- FR16: User can tap/click a marker to view place details
- FR17: User can see a modal with place information (name, address, category)
- FR18: User can close the details modal

**Statistics & Cost Tracking**
- FR19: User can see real-time tile progress (completed / total)
- FR20: User can see real-time count of places found
- FR21: User can see real-time count of API requests made
- FR22: User can see real-time estimated cost based on Mapbox pricing
- FR23: User can see per-region statistics
- FR24: User can see when an exploration is complete

**Data Persistence**
- FR25: System persists exploration data to local storage automatically
- FR26: User can return to the app and see previous explorations restored
- FR27: User can view previously fetched POIs on the map without re-fetching
- FR28: User can see stats summary for completed explorations

### NonFunctional Requirements

**Performance**
- NFR1: Map panning and zooming maintains 60fps during exploration
- NFR2: Stats dashboard updates within 100ms of new data arriving
- NFR3: Place details modal opens within 200ms of tap/click
- NFR4: UI remains responsive (no freezing) during concurrent tile fetching
- NFR5: Initial app load completes within 3 seconds
- NFR6: Local storage operations complete within 50ms

**Integration**
- NFR7: App implements client-side rate limiting (max 5-10 concurrent Mapbox requests)
- NFR8: App handles Mapbox API errors gracefully with user-visible feedback
- NFR9: App handles network disconnection without data loss (queued requests can resume)
- NFR10: Cost calculation uses current Mapbox pricing (100k free tier, then per-request)

**Data Integrity**
- NFR11: All fetched POIs are persisted to local storage without data loss
- NFR12: Exploration progress can be restored after browser refresh
- NFR13: Duplicate POIs (from overlapping tiles) are handled appropriately

### Additional Requirements

**From Architecture - Starter Template:**
- Project initialized with Vite vanilla-ts + Tailwind CSS v4 (COMPLETED)
- TypeScript strict mode enabled
- Mapbox GL JS installed

**From Architecture - Data Layer:**
- IndexedDB with normalized stores: regions, tiles, places, explorations
- All IDs generated via crypto.randomUUID()
- Dates stored as ISO 8601 strings

**From Architecture - State Management:**
- Central store in src/state/store.ts
- Event-driven updates using typed CustomEvent<T>
- Event naming pattern: category:action

**From Architecture - API Integration:**
- Queue-based request management with 5 concurrent requests max
- Exponential backoff retry (3 retries)
- Error categorization: Network, ApiQuota, ApiError, Storage, Unknown

**From Architecture - Code Patterns:**
- File naming: kebab-case.ts
- Feature-based module organization
- Co-located tests: module.test.ts

### FR Coverage Map

| FR | Epic | Description |
|----|------|-------------|
| FR1 | Epic 2 | Search for region by name |
| FR2 | Epic 2 | Map zoom and highlight region |
| FR3 | Epic 2 | Start new exploration |
| FR4 | Epic 2 | Multiple regions active |
| FR5 | Epic 3 | View default tile size |
| FR6 | Epic 3 | Adjust tile size |
| FR7 | Epic 3 | Preview tile count |
| FR8 | Epic 3 | Calculate tile grid |
| FR9 | Epic 3 | Select POI category |
| FR10 | Epic 4 | Start exploration |
| FR11 | Epic 4 | Concurrent fetching with rate limit |
| FR12 | Epic 4 | Store POIs in cache |
| FR13 | Epic 5 | Markers appear as tiles complete |
| FR14 | Epic 5 | Clustered markers when zoomed out |
| FR15 | Epic 5 | Zoom to individual markers |
| FR16 | Epic 5 | Click marker for details |
| FR17 | Epic 5 | Details modal with info |
| FR18 | Epic 5 | Close details modal |
| FR19 | Epic 4 | Real-time tile progress |
| FR20 | Epic 4 | Real-time place count |
| FR21 | Epic 4 | Real-time request count |
| FR22 | Epic 4 | Real-time cost estimate |
| FR23 | Epic 4 | Per-region statistics |
| FR24 | Epic 4 | Exploration complete indicator |
| FR25 | Epic 6 | Auto-persist to storage |
| FR26 | Epic 6 | Restore previous explorations |
| FR27 | Epic 6 | View cached POIs offline |
| FR28 | Epic 6 | Stats summary for completed |

## Epic List

### Epic 1: Foundation & Interactive Map
User can see and interact with a fullscreen Mapbox map.
**FRs covered:** Enables FR2, FR13, FR14, FR15 (map foundation)

### Epic 2: Region Discovery
User can search for any geographic region and see it highlighted on the map.
**FRs covered:** FR1, FR2, FR3, FR4

### Epic 3: Exploration Configuration
User can configure tile size, see tile count preview, and select POI category before starting.
**FRs covered:** FR5, FR6, FR7, FR8, FR9

### Epic 4: Live Exploration Engine
User can run explorations with real-time progress, stats, and cost tracking.
**FRs covered:** FR10, FR11, FR12, FR19, FR20, FR21, FR22, FR23, FR24

### Epic 5: Results Visualization
User can see POI markers on the map, use clustering, and view place details.
**FRs covered:** FR13, FR14, FR15, FR16, FR17, FR18

### Epic 6: Data Persistence
User can close the browser and return later with all data intact.
**FRs covered:** FR25, FR26, FR27, FR28

---

## Epic 1: Foundation & Interactive Map

User can see and interact with a fullscreen Mapbox map.

### Story 1.1: Initialize Mapbox Map

As a **user**,
I want **to see a fullscreen interactive map when I open the app**,
So that **I have a visual canvas for exploring geographic regions**.

**Acceptance Criteria:**

**Given** the user opens the app with a valid Mapbox token configured
**When** the page loads
**Then** a fullscreen Mapbox map is displayed
**And** the map defaults to a view of Europe (or reasonable default)
**And** the map loads within 3 seconds (NFR5)

**Given** the user interacts with the map
**When** they pan or zoom
**Then** the map responds at 60fps (NFR1)
**And** standard Mapbox navigation controls are visible

### Story 1.2: App Layout Shell

As a **user**,
I want **to see a clean app layout with space for controls and stats**,
So that **I can access search, configuration, and statistics alongside the map**.

**Acceptance Criteria:**

**Given** the app is loaded
**When** the user views the interface
**Then** a search bar area is visible at the top
**And** a stats dashboard panel is visible (empty/placeholder state)
**And** the map fills the remaining viewport
**And** the layout uses Tailwind CSS styling per architecture

---

## Epic 2: Region Discovery

User can search for any geographic region and see it highlighted on the map.

### Story 2.1: Region Search Input

As a **user**,
I want **to type a location name in the search bar**,
So that **I can find geographic regions to explore**.

**Acceptance Criteria:**

**Given** the app is loaded
**When** the user types in the search bar
**Then** the input accepts text (country, city, district names)
**And** a search can be triggered by pressing Enter or clicking a search button

**Given** the user submits a search
**When** the Mapbox Geocoding API is called
**Then** a loading state is shown during the request
**And** API errors are handled gracefully with user feedback (NFR8)

### Story 2.2: Display Search Results & Select Region

As a **user**,
I want **to see search results and select a region**,
So that **I can choose the exact area I want to explore**.

**Acceptance Criteria:**

**Given** a search returns results
**When** the results are displayed
**Then** the user sees a list of matching regions with names
**And** each result shows the place type (country, city, etc.)

**Given** the user clicks a search result
**When** the region is selected
**Then** the map zooms to fit the region bounds (FR2)
**And** the region is stored in application state
**And** the search results close

### Story 2.3: Highlight Region Boundary

As a **user**,
I want **to see the selected region highlighted on the map**,
So that **I can visually confirm the exploration area**.

**Acceptance Criteria:**

**Given** a region is selected
**When** the map displays the region
**Then** the region boundary is visually highlighted (polygon or bounding box)
**And** the highlight is clearly visible but doesn't obscure the map
**And** the region name is displayed in the UI

### Story 2.4: Multi-Region Support

As a **user**,
I want **to have multiple regions active simultaneously**,
So that **I can compare or explore different areas in one session** (FR4).

**Acceptance Criteria:**

**Given** a region is already selected
**When** the user searches and selects another region
**Then** both regions remain in the system
**And** the user can see a list of active regions
**And** the user can switch between regions
**And** each region maintains its own state

---

## Epic 3: Exploration Configuration

User can configure tile size, see tile count preview, and select POI category before starting.

### Story 3.1: Display Default Tile Configuration

As a **user**,
I want **to see the default tile size when a region is selected**,
So that **I understand how the region will be divided for exploration** (FR5).

**Acceptance Criteria:**

**Given** a region is selected
**When** the configuration panel is displayed
**Then** the default tile size (500m × 500m) is shown
**And** the tile size is displayed in a clear, readable format

### Story 3.2: Adjust Tile Size

As a **user**,
I want **to adjust the tile size before starting an exploration**,
So that **I can balance granularity vs. number of API requests** (FR6).

**Acceptance Criteria:**

**Given** the configuration panel is visible
**When** the user adjusts the tile size control
**Then** predefined options are available (e.g., 250m, 500m, 1km, 2km)
**And** the selected tile size is immediately reflected in the UI

### Story 3.3: Tile Count Preview

As a **user**,
I want **to see how many tiles the selected region will be divided into**,
So that **I can estimate the number of API requests before starting** (FR7, FR8).

**Acceptance Criteria:**

**Given** a region is selected and tile size is set
**When** the tile count is calculated
**Then** the total tile count is displayed in real-time
**And** changing tile size immediately updates the count
**And** the calculation uses the tile-calculator module per architecture

### Story 3.4: POI Category Selection

As a **user**,
I want **to select a POI category to search for**,
So that **I can explore specific types of places** (FR9).

**Acceptance Criteria:**

**Given** the configuration panel is visible
**When** the user views category options
**Then** a dropdown or list of POI categories is available
**And** categories include common types (grocery, stores, restaurants, etc.)

**Given** the user selects a category
**When** the selection is confirmed
**Then** the selected category is stored for the exploration
**And** the UI displays the selected category

---

## Epic 4: Live Exploration Engine

User can run explorations with real-time progress, stats, and cost tracking.

### Story 4.1: Start Exploration

As a **user**,
I want **to start an exploration with a single click**,
So that **POI fetching begins for my configured region and category** (FR10).

**Acceptance Criteria:**

**Given** a region, tile size, and category are configured
**When** the user clicks "Start Exploration"
**Then** an exploration record is created with status "running"
**And** the tile grid is generated using tile-calculator
**And** the UI transitions to show exploration in progress
**And** a `exploration:started` event is dispatched per architecture

### Story 4.2: Concurrent Tile Fetching with Rate Limiting

As a **user**,
I want **tiles to be fetched concurrently but within API limits**,
So that **exploration is fast but doesn't get throttled** (FR11, NFR7).

**Acceptance Criteria:**

**Given** an exploration is running
**When** tiles are being fetched
**Then** maximum 5 concurrent requests are active (per architecture)
**And** the request queue manages pending tiles
**And** failed requests retry with exponential backoff (3 retries)
**And** the UI remains responsive during fetching (NFR4)

### Story 4.3: Store Fetched POIs

As a **user**,
I want **fetched POIs to be stored immediately as they arrive**,
So that **no data is lost during exploration** (FR12).

**Acceptance Criteria:**

**Given** a tile fetch completes successfully
**When** POIs are returned from the API
**Then** POIs are stored in application state
**And** duplicate POIs (same mapboxId) are handled appropriately
**And** a `place:fetched` event is dispatched
**And** a `tile:completed` event is dispatched

### Story 4.4: Real-Time Tile Progress Display

As a **user**,
I want **to see tile progress updating in real-time**,
So that **I know how much of the exploration is complete** (FR19, FR24).

**Acceptance Criteria:**

**Given** an exploration is running
**When** tiles complete
**Then** the dashboard shows "X / Y tiles completed"
**And** progress updates within 100ms of tile completion (NFR2)
**And** when all tiles complete, status shows "Complete" (FR24)

### Story 4.5: Real-Time Place & Request Counts

As a **user**,
I want **to see places found and requests made updating live**,
So that **I can track the exploration results** (FR20, FR21).

**Acceptance Criteria:**

**Given** an exploration is running
**When** POIs are fetched
**Then** "Places found: N" updates in real-time
**And** "API requests: N" updates in real-time
**And** updates occur within 100ms (NFR2)

### Story 4.6: Real-Time Cost Estimation

As a **user**,
I want **to see estimated API cost updating as requests are made**,
So that **I can monitor spending** (FR22, NFR10).

**Acceptance Criteria:**

**Given** an exploration is running
**When** API requests are made
**Then** estimated cost is calculated using Mapbox pricing
**And** cost accounts for 100k free tier
**And** cost displays in USD format (e.g., "$0.00", "$1.23")
**And** cost updates in real-time

### Story 4.7: Per-Region Statistics

As a **user**,
I want **to see statistics specific to each region**,
So that **I can compare exploration results across regions** (FR23).

**Acceptance Criteria:**

**Given** multiple regions have explorations
**When** viewing the stats dashboard
**Then** stats are shown for the currently selected region
**And** switching regions updates the displayed stats
**And** each region's stats are independent

---

## Epic 5: Results Visualization

User can see POI markers on the map, use clustering, and view place details.

### Story 5.1: Display POI Markers on Map

As a **user**,
I want **to see POI markers appear on the map as tiles complete**,
So that **I can visualize the exploration results geographically** (FR13).

**Acceptance Criteria:**

**Given** an exploration is running or complete
**When** POIs are fetched for a tile
**Then** markers appear on the map at POI coordinates
**And** markers appear within 1 second of tile completion
**And** map maintains 60fps during marker updates (NFR1)

### Story 5.2: Marker Clustering

As a **user**,
I want **markers to cluster when zoomed out**,
So that **the map remains readable with many POIs** (FR14).

**Acceptance Criteria:**

**Given** multiple POIs are displayed on the map
**When** the user is zoomed out
**Then** nearby markers are grouped into clusters
**And** clusters show the count of POIs they contain
**And** clusters have a distinct visual style from individual markers

**Given** the user zooms in
**When** clusters would contain few markers
**Then** clusters expand to show individual markers (FR15)

### Story 5.3: Click Marker for Details

As a **user**,
I want **to click on a marker to see place details**,
So that **I can learn more about specific POIs** (FR16).

**Acceptance Criteria:**

**Given** POI markers are displayed on the map
**When** the user clicks on an individual marker
**Then** the place is selected
**And** a details modal opens within 200ms (NFR3)

**Given** the user clicks on a cluster
**When** the cluster is clicked
**Then** the map zooms in to show the clustered markers

### Story 5.4: Place Details Modal

As a **user**,
I want **to see a modal with place information**,
So that **I can view name, address, and category of a POI** (FR17).

**Acceptance Criteria:**

**Given** a marker is clicked
**When** the details modal opens
**Then** the modal displays the place name
**And** the modal displays the address (if available)
**And** the modal displays the category
**And** the modal is visually styled per Tailwind architecture

### Story 5.5: Close Details Modal

As a **user**,
I want **to close the details modal easily**,
So that **I can continue exploring the map** (FR18).

**Acceptance Criteria:**

**Given** the details modal is open
**When** the user clicks a close button
**Then** the modal closes
**And** the map is fully interactive again

**Given** the details modal is open
**When** the user clicks outside the modal
**Then** the modal closes

**Given** the details modal is open
**When** the user presses Escape key
**Then** the modal closes

---

## Epic 6: Data Persistence

User can close the browser and return later with all data intact.

### Story 6.1: Auto-Persist Exploration Data

As a **user**,
I want **exploration data to be saved automatically**,
So that **I don't lose progress if I close the browser** (FR25, NFR11).

**Acceptance Criteria:**

**Given** an exploration is running
**When** POIs are fetched or tiles complete
**Then** data is automatically persisted to IndexedDB
**And** storage operations complete within 50ms (NFR6)
**And** regions, tiles, places, and explorations are stored in normalized stores per architecture

**Given** a new region or exploration is created
**When** the record is created
**Then** it is immediately persisted to IndexedDB

### Story 6.2: Restore Previous Explorations on Load

As a **user**,
I want **to see my previous explorations when I return to the app**,
So that **I can continue where I left off** (FR26, NFR12).

**Acceptance Criteria:**

**Given** the user has previous exploration data in IndexedDB
**When** the app loads
**Then** all regions are restored from storage
**And** all explorations are restored with their status
**And** the app state reflects the persisted data
**And** restoration completes during initial load (<3s total)

### Story 6.3: View Cached POIs Without Re-fetching

As a **user**,
I want **to view previously fetched POIs on the map without re-fetching**,
So that **I can explore results offline** (FR27).

**Acceptance Criteria:**

**Given** an exploration was previously completed
**When** the user selects that region
**Then** all cached POIs are loaded from IndexedDB
**And** markers appear on the map from cached data
**And** no new API requests are made for existing data

**Given** the user is offline
**When** they view a previously explored region
**Then** cached POIs are still displayed on the map

### Story 6.4: Stats Summary for Completed Explorations

As a **user**,
I want **to see stats summary for completed explorations**,
So that **I can review past exploration results** (FR28).

**Acceptance Criteria:**

**Given** one or more explorations are complete
**When** the user views the region list or dashboard
**Then** each completed exploration shows summary stats
**And** summary includes: tiles processed, places found, cost
**And** completion date/time is displayed
**And** stats are loaded from persisted data
