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
| Persistence | Frontend exports use `currentDiagram` from editor state. Laravel generation is backend-owned: the wizard sends that current Diagram as ephemeral request `content`. Persisted `diagrams.content` is used only when `content` is omitted. |

---

## Export families

Four conceptual families. This is primarily a **product/UX grouping**, not a shared technical pipeline.

### A. Database

Transforms the canonical `Diagram` into database DDL:

- SQL

### B. Framework

Transforms the canonical `Diagram` into framework-native schema/code artifacts:

- Laravel migrations (ZIP) — **implemented**
- Prisma (`schema.prisma`) — **implemented**
- EF Core (model project ZIP) — **implemented**
- Rails (Rails 8.1 package ZIP) — **implemented** (wizard + browser ZIP; Ruby runtime QA still pending)
- Django (Django 6.1 drop-in app ZIP) — **implemented** (wizard + browser ZIP; runtime QA deferred; manual browser/ZIP QA still required)
- Drizzle — **planned** (separate milestone)

Framework import parsers are **not** inverted into exporters. Each framework export receives its own implementation milestone with independent tests and QA.

**Framework export authentication:** framework-native exports require an authenticated user (Sanctum). This applies to Laravel, Prisma, EF Core, Rails, and Django today, and to Drizzle when implemented. Authentication is **not** paid-plan gating — registered free users may use framework exports unless another product rule applies. Portable/local exports (SQL, DBML, Diagram JSON, PNG/JPG/SVG) may remain guest-accessible.

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

**Current routing:** SQL, DBML, Diagram JSON, PNG/JPG/SVG, Laravel migrations, Prisma, EF Core, Rails, and Django are wizard-native. Backup → Export diagram still opens `ExportDiagramDialog`, which shares the Diagram JSON serializer.

**Planned framework target** (Drizzle) appears as a disabled entry until its dedicated milestone. **Prisma**, **Laravel**, **EF Core**, **Rails**, and **Django** require authentication. Prisma, EF Core, Rails, and Django are additionally gated by supported `diagram.databaseType` (unsupported DB types show a localized disabled reason for authenticated users; guests do not see those targets). Laravel remains hidden unless the diagram has a numeric backend ID.

---

## Current capability inventory

### SQL

| Attribute | Detail |
|-----------|--------|
| **Input** | Filtered `Diagram` from `useChartDB().currentDiagram` (schema filter applied to tables, relationships, dependencies) |
| **Execution** | Browser only |
| **Auth** | None (guest OK) |
| **Generators** | `frontend/src/lib/data/sql-export/export-sql-script.ts` (`exportBaseSQL`, `exportSQL`), `export-per-type/*`, `cross-dialect/*` |
| **Output** | SQL DDL string; wizard preview via `CodeSnippet` (copy + `.sql` download) |
| **Entry points** | Actions → Export wizard → SQL (`export-wizard-dialog.tsx`, `export-wizard/sql/*`); legacy `export-sql-dialog.tsx` (no user-facing entry; retained in dialog provider) |
| **Tests** | `frontend/src/lib/data/sql-export/__tests__/`; `frontend/src/dialogs/export-wizard/__tests__/export-wizard-sql.test.tsx` |

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
| **Output** | `standardDbml` (wizard export); side panel also exposes `inlineDbml` / `relationshipsDbml` for live editing |
| **Entry points** | Export wizard → DBML (`DBML_PREVIEW` with copy + `.dbml` download); side panel → DBML section (unchanged) |
| **Tests** | `frontend/src/lib/dbml/dbml-export/__tests__/`; `frontend/src/dialogs/export-wizard/__tests__/export-wizard-dbml.test.tsx` |

**Pipeline:** Diagram → `exportBaseSQL({ isDBMLFlow: true, skipFKGeneration: true })` → SQL sanitization → `@dbml/core` importer → post-processing (schemas, composite PKs, enums, refs, etc.).

**Wizard export:** Uses `standardDbml` only. Full unfiltered diagram (no schema filter). Filename: `{diagram-slug}.dbml`.

### Diagram JSON

| Attribute | Detail |
|-----------|--------|
| **Input** | Full unfiltered `currentDiagram` |
| **Execution** | Browser only |
| **Auth** | None |
| **Generator** | `diagramToJSONOutput()` in `frontend/src/lib/export-import-utils.ts` |
| **Output** | Pretty-printed Diagram-shaped JSON with sibling `schemaVersion: 1`; filename `{diagram-slug}.json` |
| **Semantics** | Portable clone snapshot. FILE preserves internal entity IDs; root file id is `"diagram"`. Import creates a **new** diagram identity. Not restore-in-place. |
| **Entry points** | Export wizard → Diagram JSON (`JSON_DOWNLOAD`); Backup → Export diagram (`ExportDiagramDialog`) |
| **Tests** | `frontend/src/lib/__tests__/diagram-json-export.test.ts`; `build-diagram-json-export-filename.test.ts`; wizard JSON branch tests |

Backup and the Export Wizard share `diagramToJSONOutput`. Do not duplicate stringify logic.

### PNG / JPG / SVG

| Attribute | Detail |
|-----------|--------|
| **Input** | Live React Flow DOM (`.react-flow__viewport`) of the **currently rendered** editor state, not `Diagram` JSON |
| **Execution** | Browser only (`html-to-image`); no backend; no AI |
| **Auth** | None |
| **Provider** | `frontend/src/context/export-image-context/export-image-provider.tsx` |
| **Helpers** | `frontend/src/lib/visual-export/` (filename, MIME, background, raster safety, capture layout) |
| **Output** | `{diagram-slug}.png` / `{diagram-slug}.jpg` / `{diagram-slug}.svg` via `downloadBlob` |
| **Entry points** | Export wizard → PNG / JPG / SVG (`VISUAL_OPTIONS`) |
| **Tests** | `frontend/src/lib/visual-export/__tests__/`; `export-wizard-visual.test.tsx`; `export-image-provider.test.tsx` |

**Rendered-state semantics:** visual export follows the live canvas, not the full unfiltered canonical `Diagram`. Schema-filter-hidden tables, `node.hidden`, and `showDBViews` remain respected. Areas follow current canvas visibility. Notes follow current canvas behavior. This intentionally differs from DBML/JSON.

**Extent:** Complete diagram (default) or current viewport. Complete export temporarily disables `onlyRenderVisibleElements` via ephemeral `visualExportCaptureActive`, waits for render, then captures with `getNodesBounds` + padded 1:1 transform on the html-to-image clone. It does not mutate Diagram positions, persisted viewport, or call `fitView`.

**Options:** PNG — scale 1/2/4 (default 2), pattern (default on), transparent (optional). JPG — same extent/scale/pattern, always opaque theme background, no transparent option. SVG — extent + pattern (default off), no scale, no transparent.

**Clean capture:** while `visualExportCaptureActive`, node/edge selection is cleared and restored; remote cursors, temp relationship UI, table edit mode, conversation indicators, and presence badges are hidden. No watermark.

**SVG limitation:** `html-to-image` `toSvg` wraps cloned HTML in a `foreignObject`. It is a browser snapshot, not a portable editable vector.

**Raster safety:** PNG/JPG reject before capture when `width * scale` or `height * scale` exceeds 16384px (html-to-image canvas limit).

### Laravel migrations (ZIP)

| Attribute | Detail |
|-----------|--------|
| **Input** | Full unfiltered `currentDiagram` sent as optional request `content`. If omitted, persisted `diagrams.content`. Generation does **not** persist the override. |
| **Execution** | Private Laravel backend |
| **Auth** | Sanctum + `DiagramPolicy::view` (owner/editor/viewer); valid backend diagram ID required. Guest/local IDs **hide** the target. Availability is independent of `databaseType`. |
| **API** | `POST /api/diagrams/{diagram}/export/laravel-migrations` |
| **Backend** | `backend/app/Http/Controllers/LaravelMigrationExportController.php` → `LaravelMigrationExportService` → `DiagramContentReader::fromArray` or `fromDiagram` → `LaravelMigrationGenerator` → `MigrationArchiveBuilder` |
| **Frontend client** | `frontend/src/lib/api/diagram-laravel-export.ts` |
| **Output** | ZIP (`{slug}-laravel-migrations.zip`) with `database/migrations/*.php` |
| **Entry points** | Export wizard → Laravel migrations (`LARAVEL_OPTIONS`) |
| **Tests** | `frontend/src/dialogs/export-wizard/__tests__/export-wizard-laravel.test.tsx`; `backend/tests/Feature/LaravelMigrationExportTest.php`, `LaravelMigrationExportSqliteExecutionTest.php`, opt-in `LaravelMigrationExportMysqlExecutionTest.php`; Unit files under `backend/tests/Unit/Services/LaravelMigrationExport/`; round-trip test in `LaravelMigrationImportExportRoundTripTest.php` |

**Options:** `laravelVersion` (`10`–`13`, default `13`), `includeIndexes` (default true), `includeForeignKeys` (default true). Versions 10–13 currently share the same generator; only the `Generated for Laravel {n}.` comment differs.

**Generator hardening:** backend output is intended to be executable (`migrate` / `migrate:rollback`) for supported schema semantics. Integer PK/FK signedness is matched from relationship-referenced columns (not from `_id` names). Schema Builder calls preserve canonical table/column names; ZIP filenames are sanitized separately. Laravel’s own `migrations` table is not exported. See [`backend/docs/laravel-migration-export.md`](../../../backend/docs/laravel-migration-export.md).

**Current-state override:** the wizard always sends `content: currentDiagram`. That payload is ephemeral generation input. It must not update `diagrams.content`, Dexie, operations, or realtime.

**Boundary:** Laravel export is a **specialized Export V1 target**. Its controller/service/DTOs must **not** define generic Export architecture. See [`backend/docs/laravel-migration-export.md`](../../../backend/docs/laravel-migration-export.md).

### Prisma (`schema.prisma`)

| Attribute | Detail |
|-----------|--------|
| **Input** | Full unfiltered `currentDiagram` (live editor state; no schema/table filter) |
| **Execution** | Private Laravel backend (`backend/app/Services/PrismaSchemaExport/`) |
| **Auth** | Sanctum (`auth:sanctum`); unauthenticated callers receive `401`. Guests **hide** the target in the wizard (same framework pattern as Laravel). Authenticated users on supported `databaseType` may export; unsupported DB types show a localized disabled reason. No backend diagram ID required. Stateless — diagram payload is not persisted. |
| **Endpoint** | `POST /api/exports/prisma` with `{ version: "6" \| "7", diagram: Diagram }` |
| **Frontend client** | `frontend/src/lib/api/prisma-export.ts` |
| **Frontend types** | `frontend/src/lib/api/prisma-export-types.ts` |
| **Target availability** | `frontend/src/lib/export/prisma-export-capability.ts` (UI-only supported DB list) + `export-target-availability.ts` (authentication + DB type) |
| **Output** | Fixed filename `schema.prisma` (`text/plain`); copy + download in wizard preview |
| **Entry points** | Export wizard → Prisma (`PRISMA_VERSION` → `PRISMA_PREVIEW`) |
| **Tests** | `frontend/src/lib/api/__tests__/prisma-export.test.ts`; `frontend/src/dialogs/export-wizard/__tests__/export-wizard-prisma.test.tsx`; backend PHPUnit under `backend/tests/Feature/PrismaSchemaExportTest.php` and `backend/tests/Unit/Services/PrismaSchemaExport/` |

**Version selector:** Prisma 7 (default, recommended) and Prisma 6. Wizard-local state only; resets to `7` on dialog close/reopen.

| Version | Generator block | Datasource |
|---------|-----------------|------------|
| Prisma 6 | `provider = "prisma-client-js"` | `provider` + `url = env("DATABASE_URL")` |
| Prisma 7 | `provider = "prisma-client"` + `output = "../generated/prisma"` | `provider` only (no URL) |

**Provider inference:** `diagram.databaseType` maps to Prisma datasource provider on the backend. No provider override in V1.

**Supported database types:** PostgreSQL, MySQL, MariaDB, SQLite, SQL Server, CockroachDB.

**Unsupported (target disabled):** Oracle, ClickHouse, GENERIC, and any type not mapped by the capability helper.

**Structural validation:** coarse availability uses database type only. Blocking generator errors (invalid PK, unsupported structural field types, etc.) surface in preview; they do not disable the target.

**Non-blocking notes:** `PrismaExportNote[]` (views skipped, schema namespaces, composite FK limitation, label-only M:N, etc.) render in a compact grouped limitations section without preventing copy/download. Schema namespace notes are aggregated per distinct `table.schema` value (with affected table count/paths in note metadata). Repeated note codes (e.g. `relation_skipped`) are grouped in the wizard with counts.

**Relationship resolution:** FK holder and referenced PK/unique sides are resolved from FoxalDB relationship cardinality/orientation, matching SQL export and editor semantics (`many:one` → FK on source; `one:many` / `one:one` → FK on target). Both canonical shapes produced by SQL/editor import and Prisma/Laravel import export to equivalent Prisma relations. Referenced-side uniqueness and FK nullability/referential actions use the resolved sides. FK scalar nullability drives FK-side relation navigation optionality: nullable FK scalar → optional FK-side navigation (`User?`); required FK scalar → required FK-side navigation (`User`).

**Mapping strategy:** deterministic `@map` / `@@map`, FK scalar fields preserved with synthesized relation fields, conservative unsupported policy. Views and schema namespaces are deferred (noted, not emitted).

**No generic framework exporter abstraction.** Prisma generation is private backend application logic. The public frontend exposes wizard UX, version selection, API transport, preview, copy/download, and availability presentation only. Production code does not call the Prisma importer.

### EF Core (model project ZIP)

| Attribute | Detail |
|-----------|--------|
| **Input** | Full unfiltered `currentDiagram` (live editor state; no schema/table filter) |
| **Execution** | Private Laravel backend (`backend/app/Services/EfCoreExport/`) |
| **Auth** | Sanctum (`auth:sanctum` + `throttle:ef-core-export`); unauthenticated callers receive `401`. Guests **hide** the target. Authenticated users on supported `databaseType` may export; unsupported DB types show a localized disabled reason. No backend diagram ID required. Stateless — diagram payload is not persisted. |
| **Endpoint** | `POST /api/exports/ef-core` with `{ diagram: Diagram, namespace?: string, dbContextName?: string }` |
| **Frontend client** | `frontend/src/lib/api/ef-core-export.ts` |
| **Frontend types** | `frontend/src/lib/api/ef-core-export-types.ts` |
| **Target availability** | `frontend/src/lib/export/ef-core-export-capability.ts` (UI-only supported DB list) + `export-target-availability.ts` (authentication + DB type) |
| **ZIP** | Built in the browser with existing `fflate` `zipSync` from `response.files[]`. Backend does **not** create a ZIP and does **not** run `dotnet`. |
| **Output** | `{slug}-ef-core.zip` (`application/zip`) using backend `filename` |
| **Entry points** | Export wizard → EF Core (`EF_CORE_OPTIONS` → `EF_CORE_RESULT`) |
| **Tests** | `frontend/src/lib/api/__tests__/ef-core-export.test.ts`; `frontend/src/lib/export/__tests__/ef-core-export-*.test.ts`; `frontend/src/dialogs/export-wizard/__tests__/export-wizard-ef-core.test.tsx`; backend PHPUnit under `backend/tests/Feature/EfCoreExportTest.php` and `backend/tests/Unit/Services/EfCoreExport/` |

**EF Core 10 / .NET 10 only.** There is no version selector and no version request field. EF6 real `.NET 10` restore/build/model QA passed for PostgreSQL, SQL Server, SQLite, and MySQL representative generated projects. EF6.1 adds MySQL catalog Policy C: canonical `table.schema` remains the MySQL database/catalog name (SQL import/export unchanged), but EF Core omits the `ToTable` qualifier when the exportable table set has zero or one distinct catalog so `Database=` selects the target database. Two or more catalogs preserve `ToTable("table", "catalog")` because Oracle `MySql.EntityFrameworkCore` treats EF schema as a MySQL database qualifier. EF6 missed this because the MySQL QA fixture used `schema: null`. `dotnet ef migrations add` from the standalone class library is **not** sufficient (no connection string / `OnConfiguring` / design-time factory); a host/startup project or `IDesignTimeDbContextFactory` is required. Browser ZIP extraction was not re-tested in EF6.

**Provider inference:** `diagram.databaseType` only. No provider override and no connection string.

**Supported database types:** PostgreSQL, SQL Server, SQLite, MySQL.

**Unsupported (target disabled for authenticated users; hidden for guests):** MariaDB (not aliased to MySQL), Oracle, CockroachDB, ClickHouse, GENERIC, unknown types.

**Artifact:** in-memory model project (entities, Fluent `DbContext`, `.csproj`, README). Migrations, ModelSnapshot, and Designer.cs are **not** generated. The README explains generating migrations locally.

**Options:** optional root namespace (frontend suggests a PascalCase value from the diagram name; blank omits the field and the backend chooses) and optional DbContext class name (frontend default `AppDbContext`; blank omits and the backend uses `AppDbContext`). Backend identifier sanitization remains authoritative.

**Notes:** backend `notes[]` are shown on the result step (message + path). Do not recreate generator note semantics in the frontend.

**ZIP safety:** frontend rejects empty, absolute, or `..` traversal paths and fails the download visibly rather than writing a dangerous archive entry.

**No generic framework exporter abstraction.** EF Core generation is private backend application logic. The public frontend exposes wizard UX, API transport, availability, notes, and browser ZIP download only.

### Rails (Rails 8.1 package ZIP)

| Attribute | Detail |
|-----------|--------|
| **Input** | Full unfiltered `currentDiagram` (live editor state; no schema/table filter) |
| **Execution** | Private Laravel backend (`backend/app/Services/RailsExport/`) |
| **Auth** | Sanctum (`auth:sanctum` + `throttle:rails-export`); unauthenticated callers receive `401`. Guests **hide** the target. Authenticated users on supported `databaseType` may export; unsupported DB types show a localized disabled reason. No backend diagram ID required. No paid-plan gate. Stateless — diagram payload is not persisted. |
| **Endpoint** | `POST /api/exports/rails` with `{ diagram: Diagram }` |
| **Frontend client** | `frontend/src/lib/api/rails-export.ts` |
| **Frontend types** | `frontend/src/lib/api/rails-export-types.ts` |
| **Target availability** | `frontend/src/lib/export/rails-export-capability.ts` (UI-only supported DB list) + `export-target-availability.ts` (authentication + DB type) |
| **ZIP** | Built in the browser with existing `fflate` `zipSync` from `response.files[]`. Backend does **not** create a ZIP and does **not** run Ruby/`rails`. |
| **Output** | `{slug}-rails.zip` (`application/zip`) using backend `filename` |
| **Entry points** | Export wizard → Rails (`RAILS_RESULT`; no version or options step) |
| **Tests** | `frontend/src/lib/api/__tests__/rails-export.test.ts`; `frontend/src/lib/export/__tests__/rails-export-*.test.ts`; `frontend/src/dialogs/export-wizard/__tests__/export-wizard-rails.test.tsx`; backend PHPUnit under `backend/tests/Feature/RailsExportTest.php` and `backend/tests/Unit/Services/RailsExport/` |

**Rails 8.1 only.** There is no version selector and no version request field. Wizard flow is `TARGET_PICKER` → `RAILS_RESULT`. Selecting Rails starts generation immediately. Ruby/`rails` runtime QA is **R6** and is not done.

**Provider inference:** `diagram.databaseType` only. No provider override and no connection string.

**Supported database types:** PostgreSQL, MySQL, MariaDB, SQLite.

**Unsupported (target disabled for authenticated users; hidden for guests):** SQL Server, Oracle, CockroachDB, ClickHouse, GENERIC, unknown types. Unsupported types are **not** aliased to PostgreSQL.

**Artifact:** README, optional `FoxalDB-NOTES.md` (backend includes it in `files[]` when notes exist), `app/models/*.rb`, baseline `db/migrate/*.rb`, `db/schema.rb`. Frontend does **not** generate `FoxalDB-NOTES.md` or any Rails source. Migrations are a current-schema baseline, not reconstructed history.

**Notes:** backend `notes[]` carry stable English `message` strings (for API/debug and generated `FoxalDB-NOTES.md`) plus structured `code`, optional `path`, and optional `metadata` for UI interpolation. The wizard localizes known note codes via `getRailsExportNotePresentation()` using `export_wizard.rails.result_step.notes.*` i18n keys in all 22 locales. Unknown codes, unknown reason tokens, or missing required metadata fall back to the backend `message`. The separate path subtitle is preserved. Do not parse English `message` strings and do not recreate generator note semantics in the frontend. `FoxalDB-NOTES.md` inside the ZIP remains backend-generated English.

**ZIP safety:** frontend rejects empty, absolute, `..` traversal, Windows drive, backslash-traversal, and duplicate paths, and fails the download visibly rather than writing a dangerous archive entry. ZIP metadata uses a stable mtime.

**No generic framework exporter abstraction.** Rails generation is private backend application logic. The public frontend exposes wizard UX, API transport, availability, localized note presentation, and browser ZIP download only.

### Django (Django 6.1 drop-in app ZIP)

| Attribute | Detail |
|-----------|--------|
| **Input** | Full unfiltered `currentDiagram` (live editor state; no schema/table filter) |
| **Execution** | Private Laravel backend (`backend/app/Services/DjangoExport/`) |
| **Auth** | Sanctum (`auth:sanctum` + `throttle:django-export`); unauthenticated callers receive `401`. Guests **hide** the target. Authenticated users on supported `databaseType` may export; unsupported DB types show a localized disabled reason. No backend diagram ID required. No paid-plan gate. Stateless — diagram payload is not persisted. |
| **Endpoint** | `POST /api/exports/django` with `{ diagram: Diagram }` |
| **Frontend client** | `frontend/src/lib/api/django-export.ts` |
| **Frontend types** | `frontend/src/lib/api/django-export-types.ts` |
| **Target availability** | `frontend/src/lib/export/django-export-capability.ts` (UI-only supported DB list) + `export-target-availability.ts` (authentication + DB type) |
| **ZIP** | Built in the browser with existing `fflate` `zipSync` from `response.files[]`. Backend does **not** create a ZIP and does **not** run Python/Django. |
| **Output** | `{slug}-django.zip` (`application/zip`) using backend `filename` |
| **Entry points** | Export wizard → Django (`DJANGO_RESULT`; no version, provider, or options step) |
| **Tests** | `frontend/src/lib/api/__tests__/django-export.test.ts`; `frontend/src/lib/export/__tests__/django-export-*.test.ts`; `frontend/src/dialogs/export-wizard/__tests__/export-wizard-django.test.tsx`; `frontend/src/i18n/__tests__/django-export-locale-consistency.test.ts`; backend PHPUnit under `backend/tests/Feature/DjangoExportTest.php` and `backend/tests/Unit/Services/DjangoExport/` |

**Django 6.1 only.** There is no version selector, no Python version selector, and no provider selector. Wizard flow is `TARGET_PICKER` → `DJANGO_RESULT`. Selecting Django starts generation immediately. Runtime Django QA is deferred to unified Framework Export QA and is not done. Manual browser/ZIP QA is still required.

**Provider inference:** `diagram.databaseType` only. No provider override and no connection string. Unsupported types are **not** aliased to SQLite.

**Supported database types:** PostgreSQL, MySQL, MariaDB, SQLite.

**Unsupported (target disabled for authenticated users; hidden for guests):** SQL Server, Oracle, CockroachDB, ClickHouse, GENERIC, unknown types.

**Artifact:** README, optional `FoxalDB-NOTES.md` (backend includes it in `files[]` when notes exist), drop-in `foxaldb_models/` app, baseline `foxaldb_models/migrations/0001_initial.py`. Frontend does **not** generate `FoxalDB-NOTES.md` or any Django source. `0001_initial.py` is a **current-schema baseline**, not reconstructed Django migration history.

**Notes:** backend `notes[]` carry stable English `message` strings (for API/debug and generated `FoxalDB-NOTES.md`) plus structured `code`, optional `path`, and optional `metadata` for UI interpolation. The D4 HTTP contract is unchanged: no `severity`, `version`, or UI-specific fields on note DTOs. The wizard applies a Django-specific frontend severity policy: **warnings** (real omissions/degradations: `view_skipped`, `keyless_table_skipped`, `keyless_model_omitted`, `type_omitted`, `type_degraded`, `enum_degraded`, `set_degraded`, `default_omitted`, `relationship_skipped`, `composite_fk_unsupported`, `set_null_omitted`, `on_delete_restrict_degraded`, `on_update_omitted`, `one_to_one_degraded_non_unique_fk`, `many_to_many_skipped`, `index_omitted`, `check_omitted`) render in an amber panel expanded by default; **technical adaptations** (`mysql_catalog_omitted`, `mysql_multiple_catalogs_ignored`, `mariadb_catalog_omitted`, `mariadb_multiple_catalogs_ignored`, `schema_ignored_sqlite`, `postgres_schema_qualified_db_table`, `model_name_adjusted`, `model_name_collision`, `field_name_adjusted`, `related_name_adjusted`, `composite_primary_key`, `many_to_many_through_skipped`, `comment_omitted`, `index_name_adjusted`, `constraint_name_adjusted`, `keyless_table_sql_created`) render in a quieter disclosure collapsed by default. Zero warnings with N adaptations reads as a successful export with optional technical details. The localized note sentence and `note.path` are separate: the path is a labeled monospace line (`Path: …` / locale equivalent), never concatenated onto the sentence. The wizard localizes known note codes via `getDjangoExportNotePresentation()` using `export_wizard.django.result_step.notes.*` i18n keys in all 22 locales. Unknown codes, unknown reason tokens, or missing required metadata fall back to the backend `message`. Do not parse English `message` strings and do not recreate generator note semantics in the frontend. `FoxalDB-NOTES.md` inside the ZIP remains backend-generated English.

**ZIP safety:** frontend rejects empty, absolute, `..` traversal, Windows drive, backslash-traversal, control characters, and duplicate paths, and fails the download visibly rather than writing a dangerous archive entry. ZIP metadata uses a stable 1980-01-01 mtime.

**No generic framework exporter abstraction.** Django generation is private backend application logic. The public frontend exposes wizard UX, API transport, availability, localized note presentation, and browser ZIP download only.

**Architectural rule:** Framework-native export generators (Laravel, Prisma, EF Core, Rails, Django, future Drizzle) are private backend-owned application logic and require authentication. Generic/portable/visual exports (SQL, DBML, Diagram JSON, PNG/JPG/SVG) may remain frontend-side where appropriate and may remain guest-accessible.

---

## SQL export capability matrix

Derived from current code (`export-sql-script.ts`, `cross-dialect-support.ts`, `export-per-type/`, `ExportSQLDialog`).

**FoxalDB Export V1 core must not require AI.** The ChartDB/OpenAI cross-dialect path is **legacy audit input**, not a FoxalDB core lifecycle dependency. V1 should advertise only **deterministic** SQL paths as supported core capabilities. Legacy AI code remains in the repository but is not part of Export architecture.

**Menu exposure:** Export wizard SQL branch exposes only deterministic targets from `getDeterministicSqlExportTargets()`. GENERIC is not offered. Oracle, CockroachDB, and ClickHouse sources show an unsupported step (no fake same-dialect target).

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

| Source → Target | Deterministic | Legacy AI | Export wizard |
|-----------------|---------------|-----------|---------------|
| PostgreSQL → MySQL | Yes (`cross-dialect/postgresql/to-mysql.ts`) | Optional toggle in legacy dialog | Yes |
| PostgreSQL → MariaDB | Yes (same converter as MySQL) | Optional toggle in legacy dialog | Yes |
| PostgreSQL → SQL Server | Yes (`cross-dialect/postgresql/to-mssql.ts`) | Optional toggle in legacy dialog | Yes |
| Any → GENERIC (target) | Yes (generic builder when `targetDatabaseType === GENERIC`) | No | **Not exposed** |
| All other cross-dialect pairs | No | **Required** (`exportSQL` + LLM config) | **Not exposed** |

Verified deterministic cross-dialect paths (`frontend/src/lib/data/sql-export/cross-dialect/cross-dialect-support.ts`):

- PostgreSQL → MySQL
- PostgreSQL → MariaDB
- PostgreSQL → SQL Server

No other deterministic cross-dialect paths exist in code. Do not infer additional paths.

### Wizard SQL routing (`export-wizard-dialog.tsx`)

FoxalDB Export Wizard calls **`exportBaseSQL` only** (never `exportSQL`). Targets come from `getDeterministicSqlExportTargets(source)`:

- Same-dialect for PostgreSQL, MySQL, MariaDB, SQL Server, SQLite
- Cross-dialect for PostgreSQL → MySQL, MariaDB, SQL Server only
- Unsupported sources (Oracle, CockroachDB, ClickHouse, GENERIC) → empty target list + unsupported step

Preview: filtered diagram via `getFilteredDiagramForSqlExport()` (same filter semantics as legacy `ExportSQLDialog`). Download: `buildSqlExportFilename()` + `downloadBlob` (`application/sql`).

### Legacy dialog routing (`ExportSQLDialog`)

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
| **Trigger** | Legacy `ExportSQLDialog` only (no wizard/menu entry); when `hasDeterministicPath` is false, or user selects AI on PG cross-dialect exports |
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

JSON-B contract (`diagramToJSONOutput`):

- Serializes a **portable clone snapshot** of the canonical `Diagram` (tables, relationships, dependencies, areas, notes, customTypes, `databaseType`, `databaseEdition`, timestamps).
- Full unfiltered diagram. Do not apply schema filters.
- Sibling root property **`schemaVersion: 1`**. No `{ diagram: ... }` wrapper. `schemaVersion` describes the Diagram-shaped document contract, not ID allocation.
- **Root file `id`** is the deterministic placeholder `"diagram"`. It is **not** the source diagram’s Dexie or Laravel persistence identity.
- **Internal entity IDs are preserved in the FILE** (tables, fields, indexes, relationships, dependencies, areas, notes, customTypes, check constraints) together with nested references (`index.fieldIds`, relationship table/field ids, dependency table ids, `table.parentAreaId`).
- **PK index names are preserved in the FILE.** Table→area membership is preserved in the FILE.
- **Import** creates a **new root identity** (`diagramFromJSONInput` assigns `generateDiagramId()`). Internal entity IDs are remapped for Dexie global primary-key safety. `cloneDiagram` remaps `parentAreaId` so imported area membership stays coherent. Imported PK index names are still cleared by generic `cloneTable` behavior.
- **Timestamps** in the FILE keep the source root `createdAt` / `updatedAt`; import resets them to `new Date()`.
- **Compatibility:** legacy unversioned Diagram-shaped JSON, JSON-A `schemaVersion: 1` running-ID files, and JSON-B `schemaVersion: 1` stable-ID files all remain importable via `detect-format.ts` → `diagram_json` and `importDiagramFromJson()`. Wizard may override `databaseType`. Import is never restore-in-place. Diagram JSON is **not** the Sync/Diff protocol.
- **Filename:** `{diagram-slug}.json`.
- **Wizard:** `TARGET_PICKER` → `JSON_DOWNLOAD` (download-oriented; no full JSON preview).
- **Backup:** still uses `ExportDiagramDialog` and the same serializer/filename helper.

**Tests:** serializer, filename, import compatibility (legacy / JSON-A / JSON-B), clone `parentAreaId`, wizard JSON branch.

---

## Image export

- **Mechanism:** `html-to-image` (`toPng`, `toJpeg`, `toSvg`) on `.react-flow__viewport`.
- **Browser-only;** requires `ExportImageProvider` mounted in the editor.
- **Independent** from canonical schema/code transformation. Do not route through SQL/DBML/JSON generators.
- **Wizard-native:** `TARGET_PICKER` → `VISUAL_OPTIONS` → explicit Export. Default extent is complete rendered diagram; current viewport remains available.
- **No watermark.** No backend. No AI.
- **SVG** is a `foreignObject` HTML snapshot (`skipFonts: true`); do not advertise it as a fully editable vector.

---

## Laravel migration export

### Flow

```
TARGET_PICKER → LARAVEL_OPTIONS → POST export
  → authorize view
  → optional request content? DiagramContentReader::fromArray
    : DiagramContentReader::fromDiagram (persisted content)
  → LaravelMigrationGenerator
  → MigrationArchiveBuilder
  → ZIP download
```

```
POST /api/diagrams/{diagram}/export/laravel-migrations
```

- **Auth:** `auth:sanctum` + `authorize('view', $diagram)` (owner / editor / viewer). Export is read-only.
- **Input:** optional JSON `content` object (canonical Diagram). If present, used only for generation and **not persisted**. If omitted, backend reads persisted `content` JSON (`name`, `tables`, `relationships`).
- **Availability:** hidden unless authenticated with a numeric backend diagram ID. Not gated by source `databaseType`.
- **Skips:** views, materialized views, and Laravel’s own `migrations` table.
- **Wizard filename:** `{slug}-laravel-migrations.zip` via `buildLaravelExportFilename` + `downloadBlob` (`application/zip`). Backend `Content-Disposition` remains for raw API clients.
- **Mature test coverage** on backend (Feature + Unit + SQLite executable migrations; opt-in MySQL unsigned PK/FK group) and wizard routing.

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
- Prisma schema export (auth-gated)
- EF Core model project export (auth-gated; browser ZIP)
- Rails 8.1 package export (auth-gated; browser ZIP; Ruby runtime QA pending)
- Django 6.1 drop-in app export (auth-gated; browser ZIP; runtime QA deferred; manual browser/ZIP QA still required)

### Strategic framework targets (separate milestones each)

Each remaining target receives its own implementation, automated tests, manual QA, commit, and push:

- Prisma export — **implemented**
- EF Core export — **implemented** (EF Core 10 / .NET 10 model project; MariaDB deferred; no Laravel `dotnet` execution; frontend ZIP; EF6 real restore/build/model QA passed)
- Rails export — **implemented** (Rails 8.1; PostgreSQL / MySQL / MariaDB / SQLite; wizard + browser ZIP; no version selector; Ruby runtime QA pending)
- Django export — **implemented** (Django 6.1; PostgreSQL / MySQL / MariaDB / SQLite; wizard + browser ZIP; no version selector; runtime QA deferred; manual browser/ZIP QA still required)
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
| DBML | Yes | Wizard-native (standard DBML only); side panel unchanged |
| Diagram JSON | Yes | Yes (via wizard) |
| Metadata JSON | Yes | No |
| Project ZIP (6 frameworks) | Yes | Laravel, Prisma, EF Core, Rails, and Django export yes; Drizzle planned (wizard shows disabled) |
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
6. **JSON files preserve internal entity IDs** of the source Diagram, but import remaps them. Sync/Diff/Merge must not treat Diagram JSON as a restore-in-place or identity-preserving import protocol. Matching successive **files** from the same live diagram can use those file IDs; matching an imported clone requires structural comparison.
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
| Diagram JSON export | `frontend/src/lib/__tests__/diagram-json-export.test.ts`, filename + wizard JSON tests | Covered (JSON-B) |
| Image export | `frontend/src/lib/visual-export/__tests__/`; wizard visual + provider tests | Covered |
| Export UX / wizard routing | `frontend/src/dialogs/export-wizard/__tests__/` | Covered (foundation + SQL + DBML + JSON + visual + Laravel + Prisma + EF Core + Rails + Django branches) |

### Expected Export V1 regression strategy

- Deterministic SQL generator unit tests (extend fixtures as dialect support grows)
- Deterministic cross-dialect fixtures (PG → MySQL/MariaDB/SQL Server)
- DBML generator smoke/regression tests
- Diagram JSON serializer, filename, import compatibility, and wizard JSON branch tests
- Laravel backend Feature/Unit tests (including optional `content` override and non-persistence)
- Export UX routing tests when unified Export UI is implemented
- Per-framework export tests in isolation (one milestone per framework)
- Browser/manual QA for downloads, theme, complete vs viewport capture, PNG transparency

---

## Known technical debt

Verified in current code:

- **Fragmented Export UX** — resolved by Export Wizard foundation; SQL, DBML, Diagram JSON, visual, Laravel, Prisma, EF Core, Rails, and Django branches are wizard-native
- **Legacy AI SQL path** — active in `exportSQL` and legacy `ExportSQLDialog`; unreachable from Export Wizard
- **Misleading UI labels** — legacy `ExportSQLDialog` still has ✨ targets, Sparkles loader, hardcoded English "Deterministic"/"AI" toggle
- **Oracle/CockroachDB/ClickHouse** — PostgreSQL exporter fallback in generator; wizard shows unsupported UX, not fake targets
- **DBML** — wizard-native export implemented; side panel remains live developer view (inline/relationships variants not exposed in wizard)
- **Diagram JSON import PK names** — `cloneTable` still clears primary-key index names on import/duplicate; JSON-B files preserve the names, imported diagrams do not
- **Inconsistent delivery** — SQL/DBML wizard have copy + download; JSON is download-only; images/Laravel file download
- **Laravel export** — requires an authenticated backend diagram ID; generation remains backend-owned
- **Prisma export** — requires authentication; generation remains backend-owned and stateless (no backend diagram ID required)
- **EF Core export** — requires authentication; generation remains backend-owned and stateless (no backend diagram ID required); ZIP is built in the browser; MariaDB is deferred; real `dotnet` restore/build/model QA passed (EF6); `dotnet ef` needs a startup project or design-time factory
- **Rails export** — requires authentication; generation remains backend-owned and stateless (no backend diagram ID required); ZIP is built in the browser; SQL Server / Oracle / CockroachDB / ClickHouse / GENERIC are disabled; Ruby/`rails` runtime QA (R6) is still pending
- **Django export** — requires authentication; generation remains backend-owned and stateless (no backend diagram ID required); ZIP is built in the browser; SQL Server / Oracle / CockroachDB / ClickHouse / GENERIC are disabled; `0001_initial.py` is a current-schema baseline, not history; runtime Django QA is deferred to unified Framework Export QA; manual browser/ZIP QA is still required
- **Schema filter asymmetry** — SQL export filtered; JSON/DBML full diagram; images follow rendered canvas (filters/hidden nodes respected)
- **SVG portability** — visual SVG remains html-to-image `foreignObject` HTML, not a native vector engine

---

## Non-goals (this architecture phase)

This document and implementation milestones do **not**:

- implement a generic `Exporter` interface
- remove legacy AI SQL code
- add Oracle/CockroachDB/ClickHouse dedicated SQL exporters
- implement Drizzle framework exporter (separate milestone)
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
- `frontend/src/lib/data/sql-export/deterministic-sql-export-capability.ts`
- `frontend/src/lib/data/sql-export/get-filtered-diagram-for-sql-export.ts`
- `frontend/src/lib/data/sql-export/build-sql-export-filename.ts`
- `frontend/src/dialogs/export-wizard/sql/`
- `frontend/src/dialogs/export-sql-dialog/export-sql-dialog.tsx` (legacy)

### Frontend — DBML

- `frontend/src/lib/dbml/dbml-export/dbml-export.ts`
- `frontend/src/dialogs/export-wizard/dbml/`
- `frontend/src/lib/dbml/dbml-export/build-dbml-export-filename.ts`
- `frontend/src/pages/editor-page/side-panel/dbml-section/`

### Frontend — JSON

- `frontend/src/lib/export-import-utils.ts`
- `frontend/src/lib/build-diagram-json-export-filename.ts`
- `frontend/src/hooks/use-export-diagram.tsx`
- `frontend/src/dialogs/export-diagram-dialog/export-diagram-dialog.tsx`
- `frontend/src/dialogs/export-wizard/json/`

### Frontend — Image

- `frontend/src/context/export-image-context/export-image-provider.tsx`
- `frontend/src/lib/visual-export/`
- `frontend/src/dialogs/export-wizard/visual/`

### Frontend — Laravel client

- `frontend/src/lib/api/diagram-laravel-export.ts`
- `frontend/src/lib/laravel-export/`
- `frontend/src/dialogs/export-wizard/laravel/`

### Frontend — Prisma client

- `frontend/src/lib/api/prisma-export.ts`
- `frontend/src/lib/api/prisma-export-types.ts`
- `frontend/src/lib/export/prisma-export-capability.ts`
- `frontend/src/dialogs/export-wizard/prisma/`

### Frontend — EF Core client

- `frontend/src/lib/api/ef-core-export.ts`
- `frontend/src/lib/api/ef-core-export-types.ts`
- `frontend/src/lib/export/ef-core-export-capability.ts`
- `frontend/src/lib/export/ef-core-export-zip.ts`
- `frontend/src/dialogs/export-wizard/ef-core/`

### Frontend — Rails client

- `frontend/src/lib/api/rails-export.ts`
- `frontend/src/lib/api/rails-export-types.ts`
- `frontend/src/lib/export/rails-export-capability.ts`
- `frontend/src/lib/export/rails-export-zip.ts`
- `frontend/src/dialogs/export-wizard/rails/`

### Frontend — Django client

- `frontend/src/lib/api/django-export.ts`
- `frontend/src/lib/api/django-export-types.ts`
- `frontend/src/lib/export/django-export-capability.ts`
- `frontend/src/lib/export/django-export-zip.ts`
- `frontend/src/dialogs/export-wizard/django/`
- `frontend/src/i18n/django-export-notes/`

### Frontend — UX entry

- `frontend/src/dialogs/export-wizard/`
- `frontend/src/pages/editor-page/top-navbar/menu/menu.tsx`

### Backend — Laravel export

- `backend/routes/api.php`
- `backend/app/Http/Controllers/LaravelMigrationExportController.php`
- `backend/app/Services/LaravelMigrationExport/`
- `backend/docs/laravel-migration-export.md`

### Backend — EF Core export

- `backend/app/Http/Controllers/EfCoreExportController.php`
- `backend/app/Services/EfCoreExport/`
- `backend/docs/ef-core-export.md`

### Backend — Rails export

- `backend/app/Http/Controllers/RailsExportController.php`
- `backend/app/Services/RailsExport/`
- `backend/docs/rails-export.md`

### Backend — Django export

- `backend/app/Http/Controllers/DjangoExportController.php`
- `backend/app/Services/DjangoExport/`
- `backend/docs/django-export.md`
