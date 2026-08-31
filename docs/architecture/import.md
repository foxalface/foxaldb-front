# Import architecture

Developer reference for FoxalDB v1 schema and metadata import.

## Canonical model

`Diagram` is the single in-memory representation. All import paths produce a temporary `Diagram` before any persistence or editor mutation.

| Path | Producer |
|------|----------|
| SQL DDL / pg_dump | `sqlImportToDiagram()` |
| DBML | `importDBMLToDiagram()` |
| Metadata JSON | `loadFromDatabaseMetadata()` |
| Diagram JSON file | `diagramFromJSONInput()` via create wizard `ImportSchemaStep` or standalone `ImportDiagramDialog` |

`importSchema()` is a deterministic dispatch boundary only. It does not persist, navigate, or mutate the open editor.

`mergeImportIntoDiagram()` owns additive merge into an existing diagram (tables, relationships, positioning). Used only by `ImportDatabaseDialog`.

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

### Existing diagram

- `currentDiagram.databaseType` is immutable target.
- SQL dialect mismatch → block; never switch diagram DBMS or convert silently.
- Ambiguous SQL → explicit resolution; current diagram DBMS preferred as hint.

## User flows

### Create diagram wizard

```
SELECT_DATABASE → CHOOSE_INTENT
  ├─ Create empty → persist
  ├─ Import schema → IMPORT_DATABASE (ImportSchemaStep) → [SELECT_TABLES?] → persist
  │    Supports SQL, DBML, metadata JSON, and diagram JSON (with DBMS mismatch resolution)
  └─ Import from existing database → IMPORT_FROM_DATABASE → [SELECT_TABLES?] → persist
```

`SELECT_TABLES` back navigation is origin-aware (`schema` | `from_database`).

### Import into current diagram

Editor → `ImportDatabaseDialog` → `ImportSchemaStep` (mode `existing`) → `importSchema()` → `mergeImportIntoDiagram()`.

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

### Detection and dispatch

1. `ArchiveReader` opens ZIP with M1 security limits.
2. `detectProjectCandidates()` scores framework evidence; ambiguity UI when needed.
3. `collectFileBundle()` retains only framework-specific allowed files.
4. `importProject()` dispatches to `parseLocalProject()` or `parseRemoteProject()` based on per-framework capability — no UI framework conditionals for parsing.
5. Result shape: `{ framework, diagram, diagnostics }` only — no raw source, archive, or auth objects.

Merge / Fusionner is **not** part of project import; deferred to a future milestone.

### Known limitations (summary)

- **Laravel**: static migration subset; no arbitrary PHP execution.
- **Prisma**: implicit M2M join tables not synthesized.
- **EF Core**: ModelSnapshot required; owned entities limited; multiple snapshots ambiguous.
- **Rails**: `schema.rb` only; no migration replay; no check constraints/enums.
- **Django**: implicit M2M join tables not synthesized; `RunPython`/`RunSQL` ignored.
- **Drizzle**: SQL migration source only; no `schema.ts` parser; ALTER/drop/rename limitations apply.

### Legacy Laravel endpoints (separate from project import)

These remain for Compare/Sync and the editor Laravel migration import dialog:

- `POST /api/laravel-migrations/import` — legacy ZIP snapshot import (editor menu)
- `POST /api/laravel-migrations/diff` — migration diff without diagram context
- `POST /api/diagrams/{diagram}/laravel-migrations/diff` — diagram-aware diff
- `POST /api/diagrams/{diagram}/export/laravel-migrations` — export

Generic project import uses `POST /api/project-import/parse` only.

## Related files

- `lib/import/import-schema.ts` — dispatcher
- `lib/import/detect-format.ts`, `detect-sql-dialect.ts`
- `dialogs/common/import-schema/` — shared paste/file UI
- `dialogs/create-diagram-dialog/import-from-database/` — metadata extraction step
- `lib/data/sql-import/` — dialect parsers
- `lib/data/import-metadata/` — metadata scripts and loader
- `lib/project-import/` — project ZIP detection, bundle collection, local/remote parsers
- `lib/project-import/import-project.ts` — generic project import dispatcher
