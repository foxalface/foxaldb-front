# Export architecture

Developer reference for FoxalDB Export V1.

Concise product handover lives in [`AI_CONTEXT_V3.md`](../../../AI_CONTEXT_V3.md) at the workspace root. Import reference: [`import.md`](import.md).

## Schema lifecycle

FoxalDB's schema lifecycle:

```
External source
  → Import
  → canonical Diagram
  → visual editing / collaboration
  → Export
  → later Schema Diff / Sync / Merge
```

**Export consumes the canonical `Diagram`.** It must not depend on individual import parsers (SQL importers, project ZIP parsers, metadata loaders, etc.). All export generators read the in-memory or persisted diagram model, not the original external source.

Export V1 is a **multi-target product capability**. That does **not** require all export formats to share one technical dispatcher or interface. Import has `importSchema()` because multiple import paths converge on one model; export paths diverge from one model into different output artifacts. Symmetry of product grouping ≠ symmetry of code abstraction.

**Do not introduce abstractions merely for architectural symmetry with Import.**

---

## Canonical model

`Diagram` (`frontend/src/lib/domain/diagram.ts`) is the single schema representation for export.

| Concern | Rule |
|---------|------|
| Input | `Diagram` (tables, relationships, dependencies, customTypes, areas, notes, `databaseType`, optional `databaseEdition`) |
| Mutation | Exporters must **not** mutate the source `Diagram` |
| Dialect | `diagram.databaseType` is the diagram's DBMS; SQL export may target a different dialect via `targetDatabaseType` |
| Persistence | Most frontend exports use `currentDiagram` from editor state; Laravel export reads **persisted** backend content |

---

## Export families

Four conceptual families. This is primarily a **product/UX grouping**, not a shared technical pipeline.

### A. Database

Transforms the canonical `Diagram` into database DDL:

- SQL

### B. Framework

Transforms the canonical `Diagram` into framework-native schema/code artifacts:

- Laravel migrations (ZIP) — **implemented**
- Prisma — **planned** (separate milestone)
- EF Core — **planned** (separate milestone)
- Rails — **planned** (separate milestone)
- Django — **planned** (separate milestone)
- Drizzle — **planned** (separate milestone)

Framework import parsers are **not** inverted into exporters. Each framework export receives its own implementation milestone with independent tests and QA.

### C. Portable / Schema

Portable interchange formats:

- DBML
- Diagram JSON

### D. Visual

Captures the **rendered** diagram canvas:

- PNG
- JPG/JPEG
- SVG

Visual export is technically independent. It uses DOM/React Flow capture (`html-to-image`) on the live canvas, not diagram-to-text transformation. **Do not route image export through schema/code generator abstractions.**

---

## Export Wizard (UX entry)

**Implemented:** `frontend/src/dialogs/export-wizard/` — single user-facing Export entry (Actions → Export).

The wizard is **product/orchestration UX only**. It does not imply a universal exporter implementation, generic `Exporter` interface, or shared backend export router.

| Layer | Location |
|-------|----------|
| Orchestrator | `export-wizard-dialog.tsx` |
| Target registry | `export-target-registry.ts` |
| Availability | `export-target-availability.ts` |
| Target picker step | `export-target-picker-step.tsx` |
| Dialog API | `openExportWizardDialog` / `closeExportWizardDialog` in `dialog-context` |

**Target groups:** Database, Framework, Portable / Schema, Visual.

**Current routing:** Available targets temporarily delegate to existing child dialogs (`ExportSQLDialog`, `ExportDiagramDialog`, `ExportImageDialog`, `ExportLaravelMigrationsDialog`) via close-and-reopen. Future milestones migrate target-specific UX into wizard-native branch steps.

**Planned framework targets** (Prisma, EF Core, Rails, Django, Drizzle) appear as disabled entries until their dedicated milestones.

---

## Current capability inventory

### SQL

| Attribute | Detail |
|-----------|--------|
| **Input** | Filtered `Diagram` from `useChartDB().currentDiagram` (schema filter applied to tables, relationships, dependencies) |
| **Execution** | Browser only |
| **Auth** | None (guest OK) |
| **Generators** | `frontend/src/lib/data/sql-export/export-sql-script.ts` (`exportBaseSQL`, `exportSQL`), `export-per-type/*`, `cross-dialect/*` |
| **Output** | SQL DDL string; displayed in `ExportSQLDialog` via `CodeSnippet` (copy only, no file download) |
| **Entry points** | Actions → Export wizard → SQL; `frontend/src/dialogs/export-sql-dialog/export-sql-dialog.tsx` |
| **Tests** | 5 files under `frontend/src/lib/data/sql-export/__tests__/` |

**Routing (`exportBaseSQL`):**

1. Same dialect (`diagram.databaseType === targetDatabaseType`) → dedicated per-type exporter in `export-per-type/`.
2. Deterministic cross-dialect (PostgreSQL source only) → `cross-dialect/postgresql/*`.
3. Otherwise → generic SQL builder in `export-sql-script.ts` using `dataTypeMap[targetDatabaseType]`.
4. Legacy AI path (`exportSQL`) → runs `exportBaseSQL` first, then client-side LLM conversion when source ≠ target and deterministic path is not selected.

### DBML

| Attribute | Detail |
|-----------|--------|
| **Input** | Full `currentDiagram` (unfiltered; empty tables/fields sanitized inside generator) |
| **Execution** | Browser only |
| **Auth** | None |
| **Generator** | `generateDBMLFromDiagram()` in `frontend/src/lib/dbml/dbml-export/dbml-export.ts` |
| **Output** | `standardDbml`, `inlineDbml`, `relationshipsDbml`; side-panel `CodeSnippet` (copy/edit, no file download) |
| **Entry points** | Export wizard (disabled, coming soon); side panel → DBML section (`frontend/src/pages/editor-page/side-panel/dbml-section/table-dbml/table-dbml.tsx`) |
| **Tests** | 9 files under `frontend/src/lib/dbml/dbml-export/__tests__/` |

**Pipeline:** Diagram → `exportBaseSQL({ isDBMLFlow: true, skipFKGeneration: true })` → SQL sanitization → `@dbml/core` importer → post-processing (schemas, composite PKs, enums, refs, etc.).

**Planned V1:** first-class DBML file export using this existing generator (UI not designed in this doc).

### Diagram JSON

| Attribute | Detail |
|-----------|--------|
| **Input** | Full unfiltered `currentDiagram` |
| **Execution** | Browser only |
| **Auth** | None |
| **Generator** | `diagramToJSONOutput()` in `frontend/src/lib/export-import-utils.ts` |
| **Output** | Pretty-printed JSON file (`ChartDB({name}).json`) |
| **Entry points** | Export wizard → Diagram JSON; Backup → Export diagram; `frontend/src/dialogs/export-diagram-dialog/export-diagram-dialog.tsx` |
| **Tests** | None dedicated to export |

### PNG / JPG / SVG

| Attribute | Detail |
|-----------|--------|
| **Input** | Live React Flow DOM (`.react-flow__viewport`), not `Diagram` JSON |
| **Execution** | Browser only (`html-to-image`) |
| **Auth** | None |
| **Provider** | `frontend/src/context/export-image-context/export-image-provider.tsx` |
| **Output** | File download (`{diagramName}.{png\|jpeg\|svg}`); PNG/JPG include FoxalDB watermark |
| **Entry points** | Export wizard → PNG/JPG/SVG; PNG/JPG via `export-image-dialog`; SVG direct call |
| **Tests** | None |

**Limitations:** current viewport only (not full diagram bounds); `skipFonts: true`; edge/marker styling relies on inline SVG preprocessing.

### Laravel migrations (ZIP)

| Attribute | Detail |
|-----------|--------|
| **Input** | Persisted `Diagram.content` JSON on backend (diagram ID only from frontend) |
| **Execution** | Private Laravel backend |
| **Auth** | Sanctum + `DiagramPolicy::view` (owner/editor/viewer); valid backend diagram ID required |
| **API** | `POST /api/diagrams/{diagram}/export/laravel-migrations` |
| **Backend** | `backend/app/Http/Controllers/LaravelMigrationExportController.php` → `LaravelMigrationExportService` → `LaravelMigrationGenerator` → `MigrationArchiveBuilder` |
| **Frontend client** | `frontend/src/lib/api/diagram-laravel-export.ts` |
| **Output** | ZIP (`{slug}-laravel-migrations.zip`) with `database/migrations/*.php` |
| **Entry points** | Export wizard → Laravel migrations (auth + backend ID); `frontend/src/dialogs/export-laravel-migrations-dialog/export-laravel-migrations-dialog.tsx` |
| **Tests** | `backend/tests/Feature/LaravelMigrationExportTest.php` + 11 Unit files under `backend/tests/Unit/Services/LaravelMigrationExport/`; round-trip test in `LaravelMigrationImportExportRoundTripTest.php` |

**Options:** `laravelVersion` (`10`–`13`, default `13`), `includeIndexes`, `includeForeignKeys`.

**Limitation:** frontend sends diagram ID only — unsaved local edits are not exported until persisted.

**Boundary:** Laravel export is a **specialized Export V1 target**. Its controller/service/DTOs must **not** define generic Export architecture. See [`backend/docs/laravel-migration-export.md`](../../../backend/docs/laravel-migration-export.md).

---

## SQL export capability matrix

Derived from current code (`export-sql-script.ts`, `cross-dialect-support.ts`, `export-per-type/`, `ExportSQLDialog`).

**FoxalDB Export V1 core must not require AI.** The ChartDB/OpenAI cross-dialect path is **legacy audit input**, not a FoxalDB core lifecycle dependency. V1 should advertise only **deterministic** SQL paths as supported core capabilities. Legacy AI code remains in the repository but is not part of Export architecture.

**Menu exposure:** Export wizard SQL route uses the diagram's current dialect only until the SQL deterministic wizard milestone restores dialect target selection. Oracle, CockroachDB, and ClickHouse are **not** export targets.

### Same-dialect export

| DBMS | Dedicated deterministic exporter | Notes |
|------|----------------------------------|-------|
| PostgreSQL | Yes (`export-per-type/postgresql.ts`) | Core supported |
| MySQL | Yes (`export-per-type/mysql.ts`) | Core supported |
| MariaDB | Yes (shared MySQL exporter) | Core supported |
| SQL Server | Yes (`export-per-type/mssql.ts`) | Core supported |
| SQLite | Yes (`export-per-type/sqlite.ts`) | Core supported |
| GENERIC | No — falls through to PostgreSQL exporter (`default` switch case) | Menu-exposed; PG-flavored output |
| CockroachDB | **No** — `default` case uses PostgreSQL exporter | **Not** official dialect support; do not advertise |
| ClickHouse | **No** — `default` case uses PostgreSQL exporter | **Not** official dialect support; do not advertise |
| Oracle | **No** — `default` case uses PostgreSQL exporter | **Not** official dialect support; do not advertise |

PostgreSQL fallback for Oracle/CockroachDB/ClickHouse produces PG-flavored DDL. This is implementation fallback, not genuine dedicated dialect support.

### Cross-dialect export

| Source → Target | Deterministic | Legacy AI | Menu |
|-----------------|---------------|-----------|------|
| PostgreSQL → MySQL | Yes (`cross-dialect/postgresql/to-mysql.ts`) | Optional toggle in dialog | Yes |
| PostgreSQL → MariaDB | Yes (same converter as MySQL) | Optional toggle | Yes |
| PostgreSQL → SQL Server | Yes (`cross-dialect/postgresql/to-mssql.ts`) | Optional toggle | Yes |
| Any → GENERIC (target) | Yes (generic builder when `targetDatabaseType === GENERIC`) | No | Conditional |
| All other cross-dialect pairs | No | **Required** (`exportSQL` + LLM config) | Partially (menu shows targets with ✨) |

Verified deterministic cross-dialect paths (`frontend/src/lib/data/sql-export/cross-dialect/cross-dialect-support.ts`):

- PostgreSQL → MySQL
- PostgreSQL → MariaDB
- PostgreSQL → SQL Server

No other deterministic cross-dialect paths exist in code. Do not infer additional paths.

### Dialog routing (`ExportSQLDialog`)

`hasDeterministicPath` is true when:

- `targetDatabaseType === GENERIC`, or
- `diagram.databaseType === targetDatabaseType`, or
- `hasCrossDialectSupport(source, target)` (PG → MySQL/MariaDB/SQL Server only)

If `hasDeterministicPath && !useAIExport` → `exportBaseSQL`. Otherwise → `exportSQL` (legacy AI).

Cross-dialect PG targets show a Deterministic/AI toggle. Other cross-dialect pairs go directly to AI with no toggle.

---

## AI / OpenAI legacy boundary

**Not part of FoxalDB Export architecture.** Documented for audit and migration only.

| Aspect | Detail |
|--------|--------|
| **Location** | `exportSQL()` in `frontend/src/lib/data/sql-export/export-sql-script.ts` |
| **Trigger** | `ExportSQLDialog` when `hasDeterministicPath` is false, or user selects AI on PG cross-dialect exports |
| **Execution** | Client-side; `@ai-sdk/openai` + `ai` package (`streamText` / `generateText`) |
| **Config** | `VITE_OPENAI_API_KEY`, `VITE_OPENAI_API_ENDPOINT`, `VITE_LLM_MODEL_NAME` (or `window.env.*`) |
| **Cache** | `localStorage` via `export-sql-cache.ts` |
| **Origin** | Inherited ChartDB behavior |
| **SaaS** | Without injected keys/custom endpoint, cross-dialect AI paths fail at `validateConfiguration()` |
| **Policy** | Must not become required for FoxalDB's core schema lifecycle; final SaaS exposure/removal is a later Export V1 UX decision |

`exportSQL` early-returns without LLM when `databaseType === diagram.databaseType` (after `exportBaseSQL`).

**Do not remove legacy AI in architecture milestones.** Do not prescribe deletion here.

---

## DBML

DBML generation is **substantially implemented and tested** but not yet a first-class file export.

- **Generator:** `generateDBMLFromDiagram()` — see pipeline above.
- **Current UX:** DBML side panel (view, copy, inline edit, apply-back via `importDBMLToDiagram`).
- **Indirect pipeline:** Diagram → SQL (`isDBMLFlow`) → `@dbml/core` → post-process fixes. Lossy; many restore passes compensate.
- **Planned V1:** expose as Export target (menu + download) reusing existing generator without redesigning the pipeline.

---

## Diagram JSON

Current export behavior (`diagramToJSONOutput`):

- Serializes a **portable Diagram-oriented** JSON object (full `Diagram` shape: tables, relationships, dependencies, areas, notes, customTypes, `databaseType`, `databaseEdition`, timestamps).
- **Entity IDs are renumbered** to running `"0"`, `"1"`, … via `cloneDiagramWithRunningIds`.
- **Diagram ID** is included but **not stable** through import (`diagramFromJSONInput` assigns a new `generateDiagramId()`).
- **Timestamps** reset to `new Date()` on import.
- **No export format version** or schema-version field.
- **Import compatibility:** structural round-trip via Create Diagram wizard (`detect-format.ts` → `diagram_json`) and `importDiagramFromJson()`; wizard may override `databaseType` with user-selected target.
- **Tests:** no dedicated export tests.

**Open decisions (block hardening, not this doc):** ID preservation policy, format versioning — both are future Sync compatibility concerns. Do not decide here.

---

## Image export

- **Mechanism:** `html-to-image` (`toPng`, `toJpeg`, `toSvg`) on React Flow viewport.
- **Browser-only;** requires `ExportImageProvider` mounted in editor.
- **Independent** from canonical schema/code transformation.
- **Viewport limitation:** captures current view, not necessarily entire diagram.
- **Test gap:** no automated tests.
- **UX note:** may be grouped under Export in future UX; technically remains separate.

---

## Laravel migration export

### Flow

```
Persisted Diagram.content (JSON)
  → DiagramContentReader
  → LaravelMigrationGenerator
  → MigrationArchiveBuilder
  → ZIP download
```

```
POST /api/diagrams/{diagram}/export/laravel-migrations
```

- **Auth:** `auth:sanctum` + `authorize('view', $diagram)`.
- **Input:** backend `Diagram` model; reads `content` JSON (`name`, `tables`, `relationships`). Dialect-agnostic normalized model.
- **Skips:** views, materialized views.
- **Mature test coverage** on backend (Feature + Unit).

Participates in Export V1 as a **specialized target**. Do not generalize `LaravelMigrationExportController` into a generic export router.

### Legacy Laravel diff endpoints (not generic Sync)

Separate from Export V1 architecture; specialized Compare/Sync legacy:

- `POST /api/laravel-migrations/diff` — compare two ZIP archives
- `POST /api/diagrams/{diagram}/laravel-migrations/diff` — compare submitted diagram JSON vs ZIP

These are **not** the future generic Schema Diff/Sync/Merge design.

---

## Export V1 product policy

### Core / must support

- Export Wizard as unified user-facing entry
- Deterministic SQL export for genuinely supported dialect paths (PostgreSQL, MySQL, MariaDB, SQL Server, SQLite; plus deterministic PG cross-dialect to MySQL/MariaDB/SQL Server)
- DBML first-class export (using existing generator)
- Diagram JSON export
- PNG / JPG / SVG
- Existing Laravel migration ZIP export (auth-gated)

### Strategic framework targets (separate milestones each)

Each receives its own implementation, automated tests, manual QA, commit, and push:

- Prisma export
- EF Core export
- Rails export
- Django export
- Drizzle export

Import support for these frameworks does **not** imply export is implemented. Framework import parsers are **not** inverted into exporters.

### Defer

- Dedicated Oracle, CockroachDB, ClickHouse SQL exporters
- Broad deterministic cross-dialect conversion matrix beyond verified PG paths
- Generic backend export API
- `ChangeSet` abstraction
- Sync / Diff / Merge implementation
- AI as a required lifecycle capability

---

## Import / Export asymmetry

**Import support does not imply Export support.**

FoxalDB imports more DBMS and framework formats than it exports in V1. Examples:

| Capability | Import | Export V1 |
|------------|--------|-----------|
| SQL DDL (8 DBMS) | Yes (varies by DBMS) | Deterministic for 5 dialects + PG cross-dialect (wizard SQL milestone) |
| DBML | Yes | Generator exists; wizard entry disabled until DBML milestone |
| Diagram JSON | Yes | Yes (via wizard) |
| Metadata JSON | Yes | No |
| Project ZIP (6 frameworks) | Yes | Laravel export yes; Prisma/EF/Rails/Django/Drizzle planned (wizard shows disabled) |
| Laravel migrations ZIP | Import (legacy + project) | Export (backend, auth) |

Do not force artificial feature symmetry.

---

## Future Sync compatibility invariants

Sync/Diff/Merge is **after Export**. No `ChangeSet` abstraction is implemented or approved. Document constraints only:

1. Sync/Diff/Merge will operate on **canonical normalized `Diagram` models**, not on exported SQL/DBML artifacts as source of truth.
2. Exporters must **not mutate** `Diagram`.
3. Dialect conversion during export must **not mutate** canonical diagram state.
4. Laravel-specific DTOs and assumptions stay in `backend/app/Services/LaravelMigrationExport/`.
5. **Schema-filtered** SQL export (via `useDiagramFilter`) is not equivalent to the full canonical diagram.
6. **JSON ID/version semantics** must be revisited before relying on portable exports for diff/merge (`cloneDiagramWithRunningIds` destroys stable entity IDs).
7. Realtime editing conflict handling (LWW, editing awareness) is **completely separate** from schema Sync/Diff/Merge.

---

## Testing strategy

Do not rely on frozen global test counts. Re-run relevant suites when validating changes.

### Current coverage (high level)

| Area | Location | Status |
|------|----------|--------|
| SQL same-dialect | `frontend/src/lib/data/sql-export/__tests__/` | Covered |
| SQL cross-dialect (PG) | `cross-dialect-export.test.ts` | Covered |
| SQL DBML flow flag | `export-sql-dbml.test.ts` | Covered |
| DBML generator | `frontend/src/lib/dbml/dbml-export/__tests__/` (9 files) | Covered |
| Laravel export | `backend/tests/Feature/LaravelMigrationExportTest.php` + Unit suite | Covered |
| Diagram JSON export | — | **Missing** |
| Image export | — | **Missing** |
| Export UX / wizard routing | `frontend/src/dialogs/export-wizard/__tests__/` | Covered (foundation) |

### Expected Export V1 regression strategy

- Deterministic SQL generator unit tests (extend fixtures as dialect support grows)
- Deterministic cross-dialect fixtures (PG → MySQL/MariaDB/SQL Server)
- DBML generator smoke/regression tests
- Diagram JSON round-trip tests (with explicit ID policy once decided)
- Laravel backend Feature/Unit tests (unchanged contract)
- Export UX routing tests when unified Export UI is implemented
- Per-framework export tests in isolation (one milestone per framework)
- Browser/manual QA for downloads, watermarks, theme, viewport capture

---

## Known technical debt

Verified in current code:

- **Fragmented Export UX** — resolved by Export Wizard foundation; target-native branch migration in progress
- **SQL dialect selection** — wizard currently routes same-dialect only; SQL deterministic milestone follows
- **Legacy AI SQL path** — active in `exportSQL`; client-side OpenAI dependency for unsupported cross-dialect pairs
- **Misleading UI labels** — ✨ on cross-dialect menu items; Sparkles loader for deterministic paths; hardcoded English "Deterministic"/"AI" toggle
- **Oracle/CockroachDB/ClickHouse** — PostgreSQL exporter fallback; not menu-exposed; not true dialect support
- **DBML** — no first-class export entry or file download
- **Diagram JSON** — `ChartDB({name}).json` filename; 1s artificial delay in `use-export-diagram.tsx`; no format version; ID renumbering
- **Inconsistent delivery** — SQL/DBML copy-only; images/JSON/Laravel file download
- **Laravel export** — requires persisted backend diagram ID
- **Schema filter asymmetry** — SQL export filtered; JSON/DBML/images unfiltered
- **Missing tests** — JSON export, image export, export UX routing

---

## Non-goals (this architecture phase)

This document and implementation milestones do **not**:

- implement a generic `Exporter` interface
- remove legacy AI SQL code
- add Oracle/CockroachDB/ClickHouse dedicated SQL exporters
- implement Prisma/EF/Rails/Django/Drizzle framework exporters (each is a separate milestone)
- modify Import
- implement Sync/Diff/Merge
- introduce `ChangeSet`
- generalize the Laravel backend export stack
- alter image rendering behavior

---

## Related files

### Frontend — SQL

- `frontend/src/lib/data/sql-export/export-sql-script.ts`
- `frontend/src/lib/data/sql-export/export-per-type/`
- `frontend/src/lib/data/sql-export/cross-dialect/`
- `frontend/src/dialogs/export-sql-dialog/export-sql-dialog.tsx`

### Frontend — DBML

- `frontend/src/lib/dbml/dbml-export/dbml-export.ts`
- `frontend/src/pages/editor-page/side-panel/dbml-section/`

### Frontend — JSON

- `frontend/src/lib/export-import-utils.ts`
- `frontend/src/hooks/use-export-diagram.tsx`
- `frontend/src/dialogs/export-diagram-dialog/export-diagram-dialog.tsx`

### Frontend — Image

- `frontend/src/context/export-image-context/export-image-provider.tsx`
- `frontend/src/dialogs/export-image-dialog/export-image-dialog.tsx`

### Frontend — Laravel client

- `frontend/src/lib/api/diagram-laravel-export.ts`
- `frontend/src/dialogs/export-laravel-migrations-dialog/export-laravel-migrations-dialog.tsx`

### Frontend — UX entry

- `frontend/src/dialogs/export-wizard/`
- `frontend/src/pages/editor-page/top-navbar/menu/menu.tsx`

### Backend — Laravel export

- `backend/routes/api.php`
- `backend/app/Http/Controllers/LaravelMigrationExportController.php`
- `backend/app/Services/LaravelMigrationExport/`
- `backend/docs/laravel-migration-export.md`
