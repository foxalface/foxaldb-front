# Import architecture

Developer reference for FoxalDB v1 schema and metadata import.

## Product rule (M11.1A)

| Action | Scope |
|--------|--------|
| **Import** | **New diagram only** — create-diagram wizard (`ImportSchemaStep`) and metadata extraction step |
| **Restore** | **New diagram from backup JSON** — `ImportDiagramDialog` (Backup → Restore; also linked from New Diagram database step) |
| **Merge** | **Existing diagram evolution** — Schema Merge wizard (`Diagram → Merge`) |

SQL, DBML, metadata JSON, diagram JSON, and project ZIP sources applied to an **open** diagram are **not** direct import. They go through Schema Merge (compare → apply), not `ImportDatabaseDialog` or additive client merge.

## Canonical model

`Diagram` is the single in-memory representation. All import paths produce a temporary `Diagram` before any persistence or editor mutation.

| Path | Producer |
|------|----------|
| SQL DDL / pg_dump | `sqlImportToDiagram()` |
| DBML | `importDBMLToDiagram()` |
| Metadata JSON | `loadFromDatabaseMetadata()` |
| Diagram JSON file | `diagramFromJSONInput()` via create wizard `ImportSchemaStep` or standalone `ImportDiagramDialog` |

`importSchema()` is a deterministic dispatch boundary only. It does not persist, navigate, or mutate the open editor.

## Detection

1. **Format** — `detectImportFormat()` classifies content as `sql`, `postgres_dump`, `dbml`, `metadata_json`, `diagram_json`, or `unsupported`. Bounded scan for large inputs.
2. **SQL dialect** — `detectSqlDialect()` scores weighted evidence per DBMS. Returns confidence, mismatch, or ambiguity.
3. **UI analysis** — `analyzeImportContent()` combines format + dialect for `ImportSchemaStep`. Maps format to an internal `ImportMethod` (`ddl` | `dbml` | `query`) for continue-handler routing only.

No AI or network calls in import paths.

## Target vs source DBMS

### New diagram

- `selectedDatabaseType` = target diagram DBMS (user choice in step 1).
- `resolvedSourceDialect` = detected/confirmed SQL source dialect.
- High-confidence mismatch → block; user may switch **new** diagram target to detected source. No cross-dialect conversion.
- Ambiguous SQL → explicit source resolution UI.
- DBML → mapped to `selectedDatabaseType`.
- Metadata → script and diagram use `selectedDatabaseType` (+ optional `databaseEdition`).

### Existing diagram (Schema Merge only)

Schema evolution on an open diagram uses **Schema Merge**, not import-into-current-diagram.

- `currentDiagram.databaseType` is the immutable target for merge.
- SQL dialect mismatch → block in merge source step; never switch diagram DBMS or convert silently.
- Ambiguous SQL → explicit resolution; current diagram DBMS preferred as hint.

Schema Merge source preparation reuses these detectors through `prepareSchemaMergeSource()`. It does not merge into the open diagram on the client. Diagram JSON is accepted when the embedded database type is compatible with the current diagram.

## User flows

### Create diagram wizard

```
SELECT_DATABASE → CHOOSE_INTENT
  ├─ Create empty → persist
  ├─ Import schema → IMPORT_DATABASE (ImportSchemaStep) → [SELECT_TABLES?] → persist
  │    Supports SQL, DBML, metadata JSON, diagram JSON, and project ZIP (with DBMS mismatch resolution)
  └─ Import from existing database → IMPORT_FROM_DATABASE → [SELECT_TABLES?] → persist
```

`SELECT_TABLES` back navigation is origin-aware (`schema` | `from_database`).

### Diagram JSON restore (backup)

`ImportDiagramDialog` — uploads a diagram backup `.json` file and creates a **new** diagram. It does **not** replace or merge into the open diagram.

| Audience | Persistence | Navigation |
|----------|-------------|------------|
| Guest | Dexie `addDiagram` + in-memory load | `/diagrams/{localId}` |
| Authenticated | `POST /diagrams` (`createDiagram`) + autosave `content_hash` seed from `GET /diagrams/{id}` | `/diagrams/{backendId}` |

Entry points: **Backup → Restore diagram**; optional shortcut from the New Diagram database step. Not in the Diagram menu.

Parsing uses `parseDiagramJsonContent()` (new diagram id via `generateDiagramId()`; table/relationship ids from `cloneDiagram`).

### Advanced metadata extraction

Manual query run in the user's database. FoxalDB does not connect directly. Scripts live in `lib/data/import-metadata/scripts/`. Edition/client variants only where they change the query.

## DBMS capability matrix (v1)

| DBMS | Empty | SQL DDL | DBML | Metadata | Editions |
|------|-------|---------|------|----------|----------|
| PostgreSQL | ✓ | ✓ | ✓ | ✓ | Supabase, Timescale |
| MySQL | ✓ | ✓ | ✓ | ✓ | 5.7 |
| MariaDB | ✓ | ✓ (MySQL family) | ✓ | ✓ | — |
| SQLite | ✓ | ✓ | ✓ | ✓ | Cloudflare D1 |
| SQL Server | ✓ | ✓ | ✓ | ✓ | 2016 and below |
| Oracle | ✓ | ✓ | ✓ | ✓ | — |
| CockroachDB | ✓ | ✓ (PostgreSQL family) | ✓ | ✓ | — |
| ClickHouse | ✓ | ✗ | ✓ | ✓ | — |

ClickHouse SQL DDL is detected but rejected in `ImportSchemaStep`; use DBML or metadata extraction.

## Legacy PostgreSQL fallback

`sqlImportToDiagram()` still accepts `sourceDatabaseType === GENERIC` for tests and internal callers: auto-detect, else default to PostgreSQL. **Active UI never passes GENERIC** — `importSchema()` requires `resolvedSourceDialect`.

## Persistence timing

No diagram is created until:

1. Content validates and converts to a temporary `Diagram`, and
2. Table filtering completes when `SELECT_TABLES` is required.

Guest: Dexie `addDiagram`. Authenticated: `createDiagram` API after successful parse.

## Project ZIP import (M10)

Six frameworks supported via the create-diagram wizard (`ImportSchemaStep` → project ZIP path). Always produces a **new diagram** — never merges into an existing diagram.

| Framework | Parser location | Auth required | Authoritative source |
|-----------|-----------------|---------------|----------------------|
| Laravel | Remote (private backend) | Yes | `database/migrations/*.php` (+ optional `composer.json`) |
| Prisma | Local (browser) | No | `prisma/schema.prisma` |
| Entity Framework Core | Remote (private backend) | Yes | `*ModelSnapshot.cs` (+ optional `.csproj`) |
| Rails | Local (browser) | No | `db/schema.rb` (+ optional `config/database.yml`) |
| Django | Remote (private backend) | Yes | `*/migrations/*.py` (+ optional metadata) |
| Drizzle | Local (browser) | No | `drizzle/**/*.sql` (+ journal/config) |

### Security model

- **No AI** and **no code execution** in any import path.
- **Local parsers** (Prisma, Rails, Drizzle): ZIP stays in the browser; source never uploaded.
- **Remote parsers** (Laravel, EF Core, Django): only minimum selected text files sent via authenticated `POST /api/project-import/parse`; full archive never uploaded.
- User-selected **target DBMS** is authoritative (`diagram.databaseType`); source dialect does not override it.

### Upload limits

`backend/config/uploads.php` is the product authority. The import UI reads the public subset from `GET /api/capabilities/uploads` and caches a successful response for the page session. Frontend checks are UX and local safety. Backend validation remains authoritative for anything that is posted.

`ArchiveReader.open(file, limits)` receives those archive limits explicitly. It does not keep its own numeric defaults. Compressed size, uncompressed size, entry count, per-entry size, path length, nesting depth, and zip-slip rejection stay in force.

Guest SQL/DBML/JSON import and local Prisma, Rails, and Drizzle ZIP parsing do not upload source. If the capabilities request fails, local inspection uses `CONSERVATIVE_UPLOAD_SAFETY_CEILING`. That ceiling matches the shipped backend defaults and is not a second authority. A later successful fetch replaces it. An operator override that the client has not fetched can be stricter than the ceiling; the backend still enforces that override on posted bodies. Local inspection does not continue with unlimited input.

### Detection and dispatch

1. `ArchiveReader` opens the ZIP with the resolved archive limits.
2. `detectProjectCandidates()` scores framework evidence from canonical paths first, then applies conservative **virtual layout** inference when canonical structure is missing but file content signatures are strong (physical paths are mapped to logical framework paths in bundle metadata only).
3. `collectFileBundle()` retains only framework-specific allowed files (reads physical paths, exposes logical paths to parsers).
4. `importProject()` dispatches to `parseLocalProject()` or `parseRemoteProject()` based on per-framework capability — no UI framework conditionals for parsing.
5. Result shape: `{ framework, diagram, diagnostics }` only — no raw source, archive, or auth objects.

Users may upload a full project ZIP, a project subfolder ZIP, or a minimal relevant-files ZIP. Canonical framework directory structure is **not** required when FoxalDB can identify the framework unambiguously from file content and companion artifacts.

When a single archive contains **multiple logical database schemas** (for example Laravel `database/migrations/catalog/` and `database/migrations/tenant/`, or multiple EF Core `DbContext` snapshots), FoxalDB detects the groups and asks which schema to import. One selected group produces one new diagram. Shared root migrations may be included as supporting files when framework semantics require them.

Project ZIP import still creates a new diagram. Schema Merge source preparation reuses `importProject()` and does not merge into the open diagram on the client. See [schema merge](./schema-merge.md).

### Known limitations (summary)

- **Laravel**: static migration subset; no arbitrary PHP execution.
- **Prisma**: implicit M2M join tables not synthesized.
- **EF Core**: ModelSnapshot required; owned entities limited; multiple snapshots ambiguous.
- **Rails**: `schema.rb` only; no migration replay; no check constraints/enums.
- **Django**: implicit M2M join tables not synthesized; `RunPython`/`RunSQL` ignored.
- **Drizzle**: SQL migration source only; no `schema.ts` parser; ALTER/drop/rename limitations apply.

### Legacy Laravel endpoints (separate from project import)

These remain for export round-trip QA and optional backend tooling (M11.1B removed the editor Laravel import/sync dialogs):

- `POST /api/diagrams/{diagram}/export/laravel-migrations` — Laravel migration **export** (active)
- **Removed in M11.4** (no production callers): `POST /api/laravel-migrations/import`, `POST /api/laravel-migrations/diff`, `POST /api/diagrams/{diagram}/laravel-migrations/diff`. Laravel project import uses `POST /api/project-import/parse` only.

Generic project import uses `POST /api/project-import/parse` only.

## M11.1C — contracts and semantic QA foundation

### Canonical project framework identifiers

| Location | Identifiers |
|----------|-------------|
| **Local parsers (browser)** | `prisma`, `drizzle`, `rails` |
| **Remote parsers (`POST /api/project-import/parse`)** | `laravel`, `entity_framework_core`, `django` |

Aliases such as `ef_core` or `laravel_migrations` are **not** accepted. The frontend must never send local-only framework names to the remote API (`InvalidRemoteProjectFrameworkError` before any network call).

### Remote project import request (v1)

Authenticated `POST /api/project-import/parse` JSON body:

- `framework` — remote identifier (required)
- `files` — `{ path, content }[]` logical project-relative paths (required)
- `targetDatabaseType` — diagram target DBMS (required)
- `rootPath` — optional project root inside the archive

Success: `{ data: { apiVersion: "1", framework, diagram, diagnostics } }`. The frontend normalizes `diagram` via `normalizeProjectImportPayload()`.

422 errors: `{ message, code, path?, framework? }` with stable `code` values (`unsafe_path`, `bundle_total_too_large`, `project_import_parse_failed`, …). UI maps known codes to `new_diagram_dialog.import_schema.errors.project_import.*` keys; unknown failures use generic `import_failed`.

### Project bundle prechecks

After `collectFileBundle()`, the wizard may precheck `projectImport.*` limits from `GET /api/capabilities/uploads` (file count, per-file bytes, total bytes, path length, depth). Backend bundle validation remains authoritative.

### Semantic import QA (test-only)

Goldens for M11.2+ use `lib/import/test-support/diagram-semantic-projection.ts` (`projectDiagramSemantics()`). It strips diagram/table/field/relationship ids and layout, sorts deterministically, and expresses relationships as **referencing FK column → referenced column**. It does not normalize `null` vs `undefined` vs `false`.

**Fixture convention:** reusable sources → `lib/import/__tests__/fixtures/semantic/`; tests → `lib/import/__tests__/semantic/`. Framework project goldens (M11.3) → `lib/project-import/__tests__/fixtures/` and realistic `m10-realistic-*` tests.

#### M11.2 semantic golden matrix

| Source family | Entry point | Dialect / notes |
|---------------|-------------|-----------------|
| SQL DDL | `importSchema()` → `sqlImportToDiagram()` | PostgreSQL, CockroachDB, MySQL, MariaDB, SQLite, SQL Server, Oracle |
| PostgreSQL dump | same SQL path (`format: postgres_dump` detection) | Dump noise + `ALTER TABLE` constraints |
| DBML | `importSchema()` → `importDBMLToDiagram()` | Multi-schema, enums, refs |
| Metadata JSON | `importSchema()` → `loadFromDatabaseMetadata()` | Views (`view_name`), base64 `view_definition`, custom types |
| Diagram JSON | `importDiagramFromJson()` / parse path | Canonical diagram restore semantics |

**Default schema (importer output, not normalized in tests):**

| Engine | Unqualified table `schema` |
|--------|------------------------------|
| PostgreSQL, CockroachDB | `public` |
| SQL Server | `dbo` |
| MySQL, MariaDB, SQLite, Oracle (baseline fixtures) | `''` or `undefined` (no `public` injection) |

**Raw `DBRelationship` orientation:** SQL and metadata importers historically store **referenced → FK holder** on `source`/`target`. DBML import stores **FK holder → referenced**. Semantic goldens always assert **referencing FK → referenced key** via `projectDiagramSemantics()`. Application code must not infer FK meaning from raw `source`/`target` alone without importer context.

#### M11.3 framework project semantic goldens

| Framework | Parser location | Authoritative source | Semantic tests |
|-----------|-----------------|----------------------|----------------|
| Prisma | local (`parsePrismaProject`) | `prisma/schema.prisma` | `project-import/__tests__/semantic/semantic-golden-local-frameworks.test.ts` |
| Rails | local (`parseRailsProject`) | `db/schema.rb` | same |
| Drizzle | local (`parseDrizzleProject`) | ordered `drizzle/*.sql` + journal/config | same (+ cumulative `varchar(32)` / ALTER replay) |
| Laravel | remote (`POST /api/project-import/parse`) | `database/migrations/*.php` | backend `FrameworkSemanticGoldenTest` + `ProjectDiagramSemantics` |
| EF Core | remote | `*ModelSnapshot.cs` | backend semantic goldens (M7.2 aggregation, `HasColumnName`) |
| Django | remote | `**/migrations/*.py` | backend semantic goldens (M9.1 cumulative `catalog_products`) |

**Auth / guest:** local frameworks parse as guest or authenticated; remote frameworks detect for guests but require auth to parse (`canExecuteProjectImport`).

**Enum / custom types:** Prisma enums → Diagram custom types; Laravel migration `enum()` when parsed; Drizzle via SQL; Rails/Django choices generally **not** custom DB types (P2).

**Relationship semantics:** goldens assert **referencing FK → referenced key** via `projectDiagramSemantics()` (frontend) or `Tests\Support\ProjectImport\ProjectDiagramSemantics` (backend). Django default table names (`users_user`, `posts_post`) and EF PascalCase PK columns (`Id`) are preserved in Diagram field names.

#### M11.4 security and error hardening

- **Static parsing only** for all active importers; no execution of uploaded project code.
- **Remote ProjectImport** sends filtered `{ path, content }` text bundles; backend revalidates paths, sizes, evidence, and framework file policies (`ProjectImportBundleValidator`).
- **Limits:** `GET /api/capabilities/uploads` → `projectImport.*` and archive limits; frontend `validateProjectImportBundle()` mirrors concepts; backend `config/uploads.php` is authoritative.
- **Stable error codes** (`unsafe_path`, `duplicate_path`, `bundle_*`, `project_import_parse_failed`, …) map to i18n via `resolveProjectImportErrorKey()` and Merge reuses `resolveProjectImportFailureKey()` for the same backend codes.
- **Legacy Laravel ZIP import/diff HTTP APIs removed** (M11.4); export endpoint retained.

**Documented limitations (P2/P3, not fixed in M11.2):**

- PostgreSQL `COMMENT ON` → field/table comments not mapped from SQL DDL.
- DBML has no view construct in current importer (`isView` stays false for DBML tables).
- Some malformed SQL DDL is still parsed instead of failing (`semantic-golden-edge-cases` documents one case).
- Referential `ON UPDATE` / `ON DELETE` may differ between SQL and DBML for the same semantic FK; endpoint goldens compare referencing/referenced columns, not necessarily every action string across families.

## Related files

- `lib/import/import-schema.ts` — dispatcher
- `lib/import/detect-format.ts`, `detect-sql-dialect.ts`
- `dialogs/common/import-schema/` — shared paste/file UI (create wizard + merge source reuse)
- `dialogs/create-diagram-dialog/import-from-database/` — metadata extraction step
- `lib/data/sql-import/` — dialect parsers
- `lib/data/import-metadata/` — metadata scripts and loader
- `lib/project-import/` — project ZIP detection, bundle collection, local/remote parsers
- `lib/project-import/import-project.ts` — generic project import dispatcher
- `lib/schema-merge/prepare-schema-merge-source.ts` — Schema Merge source preparation
