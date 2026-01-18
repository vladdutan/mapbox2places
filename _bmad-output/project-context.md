---
project_name: 'map2places'
user_name: 'Victor'
date: '2026-01-18'
sections_completed: ['technology_stack', 'typescript_rules', 'event_rules', 'naming_rules', 'storage_rules', 'api_rules', 'state_rules', 'testing_rules', 'anti_patterns']
status: 'complete'
rule_count: 25
optimized_for_llm: true
---

# Project Context for AI Agents

_This file contains critical rules and patterns that AI agents must follow when implementing code in this project. Focus on unobvious details that agents might otherwise miss._

---

## Technology Stack & Versions

| Technology | Version | Notes |
|------------|---------|-------|
| TypeScript | ES2020+ target | Strict mode enabled |
| Vite | @latest | Vanilla-ts template |
| Tailwind CSS | v4 | Via @tailwindcss/vite plugin |
| Mapbox GL JS | @latest | With @types/mapbox-gl |
| IndexedDB | Browser native | Normalized stores |

## Critical Implementation Rules

### TypeScript Rules

- Use strict mode - no `any` types without explicit justification
- Use `interface` for object shapes, `type` for unions/intersections
- All CustomEvents must be typed: `CustomEvent<PayloadType>`
- Use `crypto.randomUUID()` for all ID generation - never custom IDs

### Event System Rules

**Event Naming Pattern:** `category:action` (kebab-case)
```typescript
// CORRECT
'exploration:started', 'tile:completed', 'error:api'

// WRONG - never use these patterns
'explorationStarted', 'TILE_COMPLETED', 'onTileComplete'
```

**Event Dispatch Pattern:**
```typescript
window.dispatchEvent(new CustomEvent<TileCompletedPayload>('tile:completed', {
  detail: { explorationId, tileId, placesFound }
}));
```

### File & Code Naming

| Element | Convention | Example |
|---------|------------|---------|
| Files | kebab-case.ts | `tile-calculator.ts` |
| Functions | camelCase | `calculateTileGrid()` |
| Types/Interfaces | PascalCase | `interface Exploration` |
| Constants | UPPER_SNAKE_CASE | `MAX_CONCURRENT_REQUESTS` |
| Enums | PascalCase + PascalCase values | `TileStatus.Pending` |

### IndexedDB Rules

**Store Names:** lowercase plural (`regions`, `tiles`, `places`, `explorations`)
**Field Names:** camelCase (`regionId`, `fetchedAt`, `mapboxId`)

**Date Storage:** Always ISO 8601 strings, never timestamps
```typescript
// CORRECT
{ createdAt: '2026-01-18T10:30:00Z' }

// WRONG
{ createdAt: Date.now() }
{ createdAt: new Date() }
```

### API Request Rules

- Maximum 5 concurrent Mapbox API requests
- Use queue-based request management in `src/api/queue.ts`
- Implement exponential backoff (3 retries) for failures
- Categorize errors: `Network | ApiQuota | ApiError | Storage | Unknown`

### State Management Rules

- Single source of truth in `src/state/store.ts`
- Use immutable updates via spread operator
- Always dispatch events after state changes
- Never mutate state directly

### Module Boundaries

| Directory | Responsibility | External Access |
|-----------|----------------|-----------------|
| `src/api/` | All Mapbox API calls | Only via queue |
| `src/storage/` | All IndexedDB operations | Via entity modules |
| `src/state/` | Application state | Via store.ts only |
| `src/map/` | Mapbox GL interactions | Via map.ts |

### Anti-Patterns to Avoid

```typescript
// ❌ NEVER: Untyped events
dispatchEvent(new CustomEvent('tile:completed', { detail: data }))

// ❌ NEVER: Wrong file naming
MapUtils.ts, map_utils.ts, mapUtils.ts

// ❌ NEVER: Direct state mutation
state.tiles.push(newTile)

// ❌ NEVER: Mixed date formats
{ createdAt: Date.now() }

// ❌ NEVER: Uncategorized errors
catch (e) { console.log(e) }
```

### Testing Rules

- Co-locate tests with source: `geo.ts` → `geo.test.ts`
- Test file naming: `{module}.test.ts`
- Focus on pure functions in `utils/` and `exploration/`

---

## Usage Guidelines

**For AI Agents:**
- Read this file before implementing any code
- Follow ALL rules exactly as documented
- When in doubt, prefer the more restrictive option
- Refer to `architecture.md` for full architectural context

**For Humans:**
- Keep this file lean and focused on agent needs
- Update when technology stack changes
- Review periodically for outdated rules

Last Updated: 2026-01-18
