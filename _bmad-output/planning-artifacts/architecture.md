---
stepsCompleted: [1, 2, 3, 4, 5, 6, 7, 8]
inputDocuments: ['prd.md']
workflowType: 'architecture'
project_name: 'map2places'
user_name: 'Victor'
date: '2026-01-18'
lastStep: 8
status: 'complete'
completedAt: '2026-01-18'
---

# Architecture Decision Document

_This document builds collaboratively through step-by-step discovery. Sections are appended as we work through each architectural decision together._

## Project Context Analysis

### Requirements Overview

**Functional Requirements:**
28 FRs across 6 capability areas. The architecture must support:
- Geographic region search and boundary display
- Tile grid calculation and configurable sizing
- Concurrent POI fetching with real-time progress
- Interactive map with clustering and details modal
- Live statistics and cost tracking
- Persistent multi-region exploration data

**Non-Functional Requirements:**
13 NFRs driving architectural decisions:
- Performance: 60fps map interaction, <100ms stats updates, <3s initial load
- Integration: Rate-limited API access (5-10 concurrent), graceful error handling
- Data Integrity: No data loss on refresh, duplicate POI handling

**Scale & Complexity:**
- Primary domain: Frontend SPA
- Complexity level: Low
- Estimated architectural components: 6-8 core modules

### Technical Constraints & Dependencies

- **No backend:** All logic client-side
- **Mapbox APIs:** Geocoding (region search), Category Search (POI fetching, 25 results/request limit)
- **Browser storage:** IndexedDB for persistence
- **Modern browsers only:** ES6+, no polyfills needed

### Cross-Cutting Concerns Identified

1. **Request Management:** Rate limiting, queuing, retry logic for Mapbox API calls
2. **State Synchronization:** Real-time updates across map, stats dashboard, and storage
3. **Data Persistence:** IndexedDB with exploration state, POI data, and progress tracking
4. **Error Handling:** Network failures, API quota limits, malformed responses

## Starter Template Evaluation

### Primary Technology Domain

Web SPA (Client-side single-page application) based on project requirements.

### Technical Preferences

| Preference | Selection |
|-----------|-----------|
| Language | TypeScript |
| Framework | Vanilla (no React/Vue/Svelte) |
| Build Tool | Vite |
| Styling | Tailwind CSS |

### Selected Starter: Vite vanilla-ts + Tailwind

**Rationale:**
- Official Vite template ensures latest features and best practices
- Vanilla TS keeps bundle size minimal - no framework overhead
- Tailwind provides utility-first CSS without runtime cost
- Perfect fit for a focused utility app like map2places

**Initialization Commands:**

```bash
# Create project with Vite
npm create vite@latest map2places -- --template vanilla-ts
cd map2places
npm install

# Add Tailwind CSS
npm install -D tailwindcss @tailwindcss/vite

# Add Mapbox dependencies
npm install mapbox-gl
npm install -D @types/mapbox-gl
```

### Architectural Decisions Provided by Starter

**Language & Runtime:**
- TypeScript with strict mode
- ES2020+ target for modern browsers
- ESM modules

**Build Tooling:**
- Vite for development server and production builds
- Hot Module Replacement (HMR) for fast development
- Optimized production bundles with tree-shaking

**Styling Solution:**
- Tailwind CSS via `@tailwindcss/vite` plugin
- Utility-first approach
- Purged unused styles in production

**Project Structure:**
```
map2places/
├── src/
│   ├── main.ts          # Entry point
│   ├── style.css        # Global styles + Tailwind
│   └── vite-env.d.ts    # Vite type declarations
├── public/              # Static assets
├── index.html           # HTML entry
├── vite.config.ts       # Vite configuration
├── tsconfig.json        # TypeScript config
└── package.json
```

**Note:** Project initialization should be the first implementation story.

## Core Architectural Decisions

### Decision Priority Analysis

**Critical Decisions (Block Implementation):**
- IndexedDB schema design (normalized stores)
- State management approach (simple store + events)
- API request management (queue with rate limiting)

**Important Decisions (Shape Architecture):**
- Module organization (feature-based)
- Error handling strategy (centralized handler)

**Deferred Decisions (Post-MVP):**
- CI/CD pipeline (not needed for personal tool MVP)
- Analytics/monitoring (not applicable)

### Data Architecture

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Storage Engine | IndexedDB | Large dataset support, async API, browser-native |
| Schema Design | Normalized stores | Better querying, performance with large datasets |
| Stores | `regions`, `tiles`, `places`, `explorations` | Clean separation of concerns |

**IndexedDB Schema:**
```
regions: { id, name, bounds, createdAt }
tiles: { id, regionId, bounds, status, fetchedAt }
places: { id, tileId, regionId, mapboxId, name, category, coordinates, metadata }
explorations: { id, regionId, category, tileSize, status, stats, startedAt, completedAt }
```

### Authentication & Security

| Decision | Choice | Rationale |
|----------|--------|-----------|
| User Auth | None | Personal utility tool |
| API Token | Environment variable | Mapbox token via `import.meta.env.VITE_MAPBOX_TOKEN` |

### API & Communication Patterns

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Request Management | Queue-based with concurrency limit | Respect Mapbox rate limits |
| Concurrency | 5 concurrent requests (configurable) | Balance speed vs API limits |
| Retry Strategy | Exponential backoff (3 retries) | Handle transient failures |
| Error Categorization | Network / API / Quota / Storage | Different handling per type |

### Frontend Architecture

| Decision | Choice | Rationale |
|----------|--------|-----------|
| State Management | Simple Store + CustomEvents | No framework, minimal overhead |
| Module Organization | Feature-based | Group by capability, not file type |
| UI Updates | Event-driven | Decouple state from DOM manipulation |

**Module Structure:**
```
src/
├── main.ts              # Entry point, app initialization
├── state/               # Application state
│   └── store.ts         # Central state + events
├── map/                 # Map-related modules
│   ├── map.ts           # Mapbox initialization
│   ├── markers.ts       # Marker/cluster management
│   └── regions.ts       # Region highlighting
├── api/                 # External API integration
│   ├── mapbox.ts        # Mapbox API client
│   ├── queue.ts         # Request queue
│   └── geocoding.ts     # Region search
├── storage/             # IndexedDB layer
│   ├── db.ts            # Database initialization
│   ├── regions.ts       # Region CRUD
│   ├── tiles.ts         # Tile CRUD
│   └── places.ts        # Place CRUD
├── exploration/         # Core exploration logic
│   ├── tiles.ts         # Tile grid calculation
│   └── fetcher.ts       # Orchestrates tile fetching
├── ui/                  # UI components
│   ├── search.ts        # Search bar
│   ├── dashboard.ts     # Stats dashboard
│   └── modal.ts         # Place details modal
└── utils/               # Shared utilities
    ├── geo.ts           # Geospatial calculations
    └── cost.ts          # Mapbox cost calculation
```

### Infrastructure & Deployment

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Hosting | Static (any provider) | No backend, pure client-side |
| Build Output | `dist/` folder | Standard Vite output |
| Environment | `.env` for Mapbox token | Vite handles env vars |

## Implementation Patterns & Consistency Rules

### Naming Patterns

**File Naming:**
```
kebab-case.ts for all files
Examples: request-queue.ts, map-utils.ts, tile-calculator.ts
```

**Code Naming:**
| Element | Convention | Example |
|---------|------------|---------|
| Functions | camelCase | `calculateTileGrid()`, `fetchPlaces()` |
| Variables | camelCase | `tileCount`, `currentRegion` |
| Types/Interfaces | PascalCase | `interface Exploration`, `type TileStatus` |
| Constants | UPPER_SNAKE_CASE | `const MAX_CONCURRENT_REQUESTS = 5` |
| Enums | PascalCase + PascalCase values | `enum TileStatus { Pending, Fetching, Complete }` |

**IndexedDB Naming:**
```
Stores: lowercase plural (regions, tiles, places, explorations)
Fields: camelCase (regionId, fetchedAt, mapboxId)
Indexes: field name (e.g., index on 'regionId')
```

### Structure Patterns

**Type Organization:**
```
src/types/
├── exploration.types.ts   # Exploration, Region, Tile, Place
├── api.types.ts           # Mapbox API response types
├── state.types.ts         # Application state types
└── events.types.ts        # Custom event payload types
```

**Test Location:**
```
Co-located with source files
src/utils/geo.ts → src/utils/geo.test.ts
src/api/queue.ts → src/api/queue.test.ts
```

### Format Patterns

**Data Formats:**
| Format | Convention | Example |
|--------|------------|---------|
| JSON fields | camelCase | `{ regionId, tileSize, fetchedAt }` |
| Dates | ISO 8601 strings | `"2026-01-18T10:30:00Z"` |
| Coordinates | [lng, lat] array | `[-74.006, 40.7128]` |
| Bounds | [west, south, east, north] | `[25.0, 44.3, 26.2, 44.6]` |

**ID Generation:**
```typescript
// Use crypto.randomUUID() for all IDs
const id = crypto.randomUUID(); // "550e8400-e29b-41d4-a716-446655440000"
```

### Communication Patterns

**Event Naming:**
```
Pattern: category:action (kebab-case)

Examples:
- exploration:started
- exploration:completed
- tile:fetching
- tile:completed
- tile:failed
- place:fetched
- stats:updated
- error:api
- error:network
```

**Event Payload Structure:**
```typescript
// All events use typed CustomEvent
interface TileCompletedPayload {
  explorationId: string;
  tileId: string;
  placesFound: number;
}

// Dispatch
window.dispatchEvent(new CustomEvent<TileCompletedPayload>('tile:completed', {
  detail: { explorationId, tileId, placesFound }
}));

// Listen
window.addEventListener('tile:completed', (e: CustomEvent<TileCompletedPayload>) => {
  const { tileId, placesFound } = e.detail;
});
```

**State Update Pattern:**
```typescript
// Immutable updates via spread operator
function updateExploration(id: string, updates: Partial<Exploration>) {
  state.explorations = state.explorations.map(exp =>
    exp.id === id ? { ...exp, ...updates } : exp
  );
  dispatchEvent(new CustomEvent('state:updated'));
}
```

### Process Patterns

**Error Handling:**
```typescript
// Categorized errors
enum ErrorCategory {
  Network = 'network',
  ApiQuota = 'api-quota',
  ApiError = 'api-error',
  Storage = 'storage',
  Unknown = 'unknown'
}

// Central error handler
function handleError(error: unknown, category: ErrorCategory) {
  console.error(`[${category}]`, error);
  dispatchEvent(new CustomEvent('error:occurred', {
    detail: { category, message: getErrorMessage(error) }
  }));
}
```

**Loading States:**
```typescript
// Per-exploration loading tracked in state
interface ExplorationState {
  status: 'idle' | 'running' | 'paused' | 'completed' | 'error';
  tilesTotal: number;
  tilesCompleted: number;
  // ... other fields
}
```

### Enforcement Guidelines

**All AI Agents MUST:**
- Use kebab-case for all file names
- Use camelCase for all JavaScript/TypeScript identifiers (except types/constants)
- Use PascalCase for types, interfaces, and enums
- Use `category:action` pattern for all custom events
- Use typed `CustomEvent<T>` for all event dispatching
- Use `crypto.randomUUID()` for ID generation
- Store dates as ISO 8601 strings
- Co-locate tests with source files

**Anti-Patterns to Avoid:**
```typescript
// ❌ Wrong file naming
MapUtils.ts, map_utils.ts

// ❌ Wrong event naming
'tileCompleted', 'TILE_COMPLETED', 'onTileComplete'

// ❌ Untyped events
dispatchEvent(new CustomEvent('tile:completed', { detail: data }))

// ❌ Mixed date formats
{ createdAt: Date.now() } // Use ISO string instead
```

## Project Structure & Boundaries

### Complete Project Directory Structure

```
map2places/
├── README.md
├── package.json
├── vite.config.ts
├── tsconfig.json
├── .env                      # VITE_MAPBOX_TOKEN
├── .env.example
├── .gitignore
├── index.html
│
├── public/
│   └── favicon.svg
│
├── src/
│   ├── main.ts               # App entry point
│   ├── style.css             # Tailwind imports + global styles
│   ├── vite-env.d.ts
│   │
│   ├── types/
│   │   ├── exploration.types.ts
│   │   ├── api.types.ts
│   │   ├── state.types.ts
│   │   └── events.types.ts
│   │
│   ├── state/
│   │   └── store.ts          # Central state + event dispatch
│   │
│   ├── storage/
│   │   ├── db.ts             # IndexedDB initialization
│   │   ├── regions.ts
│   │   ├── tiles.ts
│   │   ├── places.ts
│   │   └── explorations.ts
│   │
│   ├── api/
│   │   ├── mapbox.ts         # Mapbox API client
│   │   ├── geocoding.ts      # Region search
│   │   ├── category-search.ts # POI fetching
│   │   └── queue.ts          # Request queue with rate limiting
│   │
│   ├── map/
│   │   ├── map.ts            # Mapbox GL initialization
│   │   ├── markers.ts        # Marker management
│   │   ├── clusters.ts       # Clustering logic
│   │   └── regions.ts        # Region boundary display
│   │
│   ├── exploration/
│   │   ├── tile-calculator.ts # Grid calculation
│   │   ├── fetcher.ts        # Orchestrates tile fetching
│   │   └── stats.ts          # Stats aggregation
│   │
│   ├── ui/
│   │   ├── search.ts         # Search bar component
│   │   ├── dashboard.ts      # Stats dashboard
│   │   ├── modal.ts          # Place details modal
│   │   ├── tile-config.ts    # Tile size controls
│   │   └── region-list.ts    # Region selector
│   │
│   └── utils/
│       ├── geo.ts            # Geospatial utilities
│       ├── cost.ts           # Mapbox cost calculator
│       └── error-handler.ts  # Centralized error handling
│
└── tests/
    ├── utils/
    │   └── geo.test.ts
    ├── exploration/
    │   └── tile-calculator.test.ts
    └── storage/
        └── db.test.ts
```

### Architectural Boundaries

**External API Boundary:**
All Mapbox API communication isolated in `src/api/`:
- `mapbox.ts` - Base client, token handling
- `geocoding.ts` - Mapbox Geocoding API
- `category-search.ts` - Mapbox Category Search API
- `queue.ts` - Rate limiting layer

**Storage Boundary:**
All IndexedDB operations isolated in `src/storage/`:
- `db.ts` - DB initialization, schema versioning
- Entity-specific files for CRUD operations

**State Boundary:**
Single source of truth in `src/state/store.ts`:
- Read: getter functions
- Write: setter functions with event dispatch
- Subscribe: window event listeners

### Requirements to Structure Mapping

| FR Category | Directory | Key Files |
|-------------|-----------|-----------|
| Region Selection (FR1-4) | `src/api/`, `src/map/` | `geocoding.ts`, `regions.ts` |
| Tile Configuration (FR5-8) | `src/exploration/` | `tile-calculator.ts` |
| POI Discovery (FR9-12) | `src/api/`, `src/exploration/` | `category-search.ts`, `fetcher.ts`, `queue.ts` |
| Map Visualization (FR13-18) | `src/map/`, `src/ui/` | `markers.ts`, `clusters.ts`, `modal.ts` |
| Statistics (FR19-24) | `src/exploration/`, `src/ui/` | `stats.ts`, `dashboard.ts` |
| Data Persistence (FR25-28) | `src/storage/` | All storage files |

### Data Flow

```
User Input → src/ui/search.ts
    ↓
Geocoding → src/api/geocoding.ts
    ↓
Tile Calculation → src/exploration/tile-calculator.ts
    ↓
POI Fetching → src/api/queue.ts → src/api/category-search.ts
    ↓
Storage → src/storage/*.ts
    ↓
State Update → src/state/store.ts → CustomEvent dispatch
    ↓
UI Update → src/ui/dashboard.ts, src/map/markers.ts
```

## Architecture Validation Results

### Coherence Validation ✅

**Decision Compatibility:**
All technology choices (Vite, TypeScript, Vanilla JS, Tailwind CSS, Mapbox GL JS, IndexedDB) are fully compatible. No version conflicts or integration issues identified.

**Pattern Consistency:**
Implementation patterns (naming conventions, event system, state management) consistently support the vanilla TypeScript approach. All patterns aligned with no-framework decision.

**Structure Alignment:**
Feature-based project structure properly supports all architectural decisions. Clear boundaries between api/, storage/, map/, exploration/, and ui/ modules enforce separation of concerns.

### Requirements Coverage Validation ✅

**Functional Requirements Coverage:**
All 28 FRs across 6 capability areas have explicit architectural support:
- Region Selection (FR1-4): Geocoding API + map region highlighting
- Tile Configuration (FR5-8): Tile calculator module
- POI Discovery (FR9-12): Queue-based fetching with rate limiting
- Map Visualization (FR13-18): Markers, clusters, details modal
- Statistics (FR19-24): Stats aggregation + dashboard + cost calculator
- Data Persistence (FR25-28): IndexedDB with normalized stores

**Non-Functional Requirements Coverage:**
All 13 NFRs addressed:
- Performance (NFR1-6): Event-driven updates, minimal framework overhead
- Integration (NFR7-10): Queue with concurrency limit, error categorization
- Data Integrity (NFR11-13): Normalized stores, exploration state tracking

### Implementation Readiness Validation ✅

**Decision Completeness:**
- All critical decisions documented with specific versions/commands
- Initialization commands provided for project setup
- Technology verification completed

**Structure Completeness:**
- Complete directory tree with all ~30 source files defined
- Requirements explicitly mapped to directories
- Integration points and boundaries clearly specified

**Pattern Completeness:**
- Naming conventions cover files, code, database, and events
- Communication patterns include typed CustomEvent examples
- Error handling with categorization and central handler defined

### Gap Analysis Results

**Critical Gaps:** None identified

**Important Gaps:** None blocking implementation

**Nice-to-Have Enhancements:**
- Mapbox API response type definitions (can be added during implementation)
- Loading spinner component pattern (straightforward to implement)
- These are implementation details, not architectural gaps

### Architecture Completeness Checklist

**✅ Requirements Analysis**
- [x] Project context thoroughly analyzed
- [x] Scale and complexity assessed (Low complexity SPA)
- [x] Technical constraints identified (no backend, browser-only)
- [x] Cross-cutting concerns mapped (request management, state sync, persistence, errors)

**✅ Architectural Decisions**
- [x] Critical decisions documented with initialization commands
- [x] Technology stack fully specified (Vite + TS + Tailwind + Mapbox GL)
- [x] Integration patterns defined (Queue-based API access)
- [x] Performance considerations addressed (60fps, <100ms updates)

**✅ Implementation Patterns**
- [x] Naming conventions established (kebab-case files, category:action events)
- [x] Structure patterns defined (feature-based modules)
- [x] Communication patterns specified (typed CustomEvents)
- [x] Process patterns documented (error handling, loading states)

**✅ Project Structure**
- [x] Complete directory structure defined (~30 source files)
- [x] Component boundaries established (api, storage, map, exploration, ui)
- [x] Integration points mapped (data flow documented)
- [x] Requirements to structure mapping complete

### Architecture Readiness Assessment

**Overall Status:** READY FOR IMPLEMENTATION

**Confidence Level:** High

**Key Strengths:**
- Clean separation of concerns with feature-based modules
- Well-defined consistency rules prevent AI agent conflicts
- Complete FR/NFR coverage with explicit mappings
- Simple, proven patterns (CustomEvents, IndexedDB, vanilla TS)

**Areas for Future Enhancement:**
- Phase 2 features (pause/resume, export, multi-category) have clear extension points
- Test patterns can expand from co-located unit tests to integration tests

### Implementation Handoff

**AI Agent Guidelines:**
- Follow all architectural decisions exactly as documented
- Use implementation patterns consistently across all components
- Respect project structure and boundaries
- Refer to this document for all architectural questions
- Use `category:action` event naming without exception
- Use `crypto.randomUUID()` for all ID generation

**First Implementation Priority:**
```bash
# Create project with Vite
npm create vite@latest map2places -- --template vanilla-ts
cd map2places
npm install

# Add Tailwind CSS
npm install -D tailwindcss @tailwindcss/vite

# Add Mapbox dependencies
npm install mapbox-gl
npm install -D @types/mapbox-gl
```

## Architecture Completion Summary

### Workflow Completion

**Architecture Decision Workflow:** COMPLETED ✅
**Total Steps Completed:** 8
**Date Completed:** 2026-01-18
**Document Location:** `_bmad-output/planning-artifacts/architecture.md`

### Final Architecture Deliverables

**Complete Architecture Document**
- All architectural decisions documented with specific versions
- Implementation patterns ensuring AI agent consistency
- Complete project structure with all files and directories
- Requirements to architecture mapping
- Validation confirming coherence and completeness

**Implementation Ready Foundation**
- 12+ architectural decisions made
- 15+ implementation patterns defined
- 6 architectural components specified (api, storage, map, exploration, ui, state)
- 41 requirements fully supported (28 FRs + 13 NFRs)

**AI Agent Implementation Guide**
- Technology stack with verified versions
- Consistency rules that prevent implementation conflicts
- Project structure with clear boundaries
- Integration patterns and communication standards

### Implementation Handoff

**For AI Agents:**
This architecture document is your complete guide for implementing map2places. Follow all decisions, patterns, and structures exactly as documented.

**Development Sequence:**
1. Initialize project using documented starter template
2. Set up development environment per architecture
3. Implement core architectural foundations
4. Build features following established patterns
5. Maintain consistency with documented rules

### Quality Assurance Checklist

**✅ Architecture Coherence**
- [x] All decisions work together without conflicts
- [x] Technology choices are compatible
- [x] Patterns support the architectural decisions
- [x] Structure aligns with all choices

**✅ Requirements Coverage**
- [x] All functional requirements are supported
- [x] All non-functional requirements are addressed
- [x] Cross-cutting concerns are handled
- [x] Integration points are defined

**✅ Implementation Readiness**
- [x] Decisions are specific and actionable
- [x] Patterns prevent agent conflicts
- [x] Structure is complete and unambiguous
- [x] Examples are provided for clarity

---

**Architecture Status:** READY FOR IMPLEMENTATION ✅

**Next Phase:** Begin implementation using the architectural decisions and patterns documented herein.

**Document Maintenance:** Update this architecture when major technical decisions are made during implementation.
