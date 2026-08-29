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

## Related files

- `lib/import/import-schema.ts` — dispatcher
- `lib/import/detect-format.ts`, `detect-sql-dialect.ts`
- `dialogs/common/import-schema/` — shared paste/file UI
- `dialogs/create-diagram-dialog/import-from-database/` — metadata extraction step
- `lib/data/sql-import/` — dialect parsers
- `lib/data/import-metadata/` — metadata scripts and loader
