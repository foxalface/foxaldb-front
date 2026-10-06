# Schema merge

Product architecture for Schema Merge. M1 is the shared contract. M5 is the frontend source adapter. No merge wizard is implemented.

The backend contract, operation ids, and error codes are specified in [`backend/docs/schema-merge.md`](../../../backend/docs/schema-merge.md). This document does not repeat that specification. Frontend types in `frontend/src/lib/schema-merge/diff-types.ts` mirror the JSON contract. They do not compute operation ids and they do not diff diagrams.

## Flow

Merge continues the schema lifecycle:

```
external source
  → existing detection / import
  → normalized Diagram
  → backend semantic diff
  → review
  → backend apply
```

`Diagram` stays canonical. The frontend sends that normalized diagram. The backend owns the semantic diff. The frontend renders `DiffOperation` values and submits a selection of operation ids.

Schema merge is not realtime conflict handling. Last-writer-wins and editing awareness stay separate.

## Wizard

The product concept is a two-step wizard:

1. Choose the incoming source. Detection and parsing reuse the existing import pipeline until it produces a normalized `Diagram`.
2. Review the backend diff and apply the selected operations.

M1 does not add the wizard, an Actions menu entry, or i18n strings.

The wizard should reuse existing shells and patterns:

- Sidebar
- Import wizard
- Export wizard

It should not invent a separate visual system for choices, headers, or footers.

## Review rows

Rows are rendered from structured fields: category, change type, identity, optional summaries, and `changes[]`. The payload does not contain English sentences.

Change type is shown with color, an icon, and text. Color is never the only signal.

| Change | Color |
| ------ | ----- |
| add    | green |
| modify | blue  |
| rename | amber |
| delete | red   |

## Deletions

Delete operations may appear in the diff. The deletion option defaults to off. The user turns it on explicitly.

## Selection

Selection is by operation id. `dependsOn` lists prerequisite operation ids.

Later UI behavior:

- selecting an operation also selects its prerequisites
- clearing a prerequisite also clears operations that depend on it

The backend Apply check is independent. It rejects a selection that is not dependency-closed. It does not add missing operations.

M1 does not implement those algorithms. Operation ids are opaque; the client does not decode them.

## Upload capabilities

M3.1 is complete. `backend/config/uploads.php` is the upload authority, and `GET /api/capabilities/uploads` publishes the public limits. The merge wizard will read those capabilities when it accepts a file or archive.

`uploads.schema_merge.payload_max_bytes` is 16 MiB. `GET /api/capabilities/uploads` exposes it as `schemaMerge.payloadMaxBytes`. The frontend capability type includes that field. Merge wizard UI is not implemented. The 512 KiB framework-export budget is not this limit.

The M5 source adapter reads `schema.textMaxBytes` for pasted text and text files, and `archive` for ZIP inspection. It does not apply `schemaMerge.payloadMaxBytes`. That limit belongs to the later Compare request.

## M5 source adapter

Status: complete. Entry point: `prepareSchemaMergeSource()` in `frontend/src/lib/schema-merge/prepare-schema-merge-source.ts`.

M5 prepares one incoming source. It does not add the wizard, an Actions menu item, autosave, realtime refetch, undo, or a Compare/Apply client. `SchemaMergeCompareRequest` is a type only. Nothing calls `POST /api/diagrams/{diagram}/merge/compare`.

```
text | text file | archive
  → existing detection / import
  → ready normalized Diagram + source.kind
    or an explicit resolution / error result
```

The adapter does not mutate the current diagram and does not change its database type. Callers pass `currentDiagram.databaseType` and, on a later call, an explicit resolution. Nothing is stored between calls.

### Input

| Input | Shape |
| ----- | ----- |
| Pasted text | `{ type: 'text', content }` |
| Text file | `{ type: 'text_file', file }` |
| Project archive | `{ type: 'archive', file }` |

A ZIP passed as `text_file` returns `archive_input_required`. Archive reading still uses `File` because `ArchiveReader.open` does.

Resolution, when the caller has one:

| Field | Meaning |
| ----- | ------- |
| `sourceDialect` | Chosen SQL dialect |
| `projectCandidateKey` | `framework:rootPath` from `getProjectCandidateKey()` |
| `databaseGroupId` | Chosen `ProjectDatabaseGroup.id` |

### Result

| Status | When |
| ------ | ---- |
| `ready` | Normalized `incomingDiagram` and `source: { kind }` |
| `needs_dialect_resolution` | Existing `ImportDetectionAnalysis` for ambiguous SQL |
| `needs_project_resolution` | Existing `ProjectArchiveAnalysis` when more than one project can be selected |
| `needs_database_group_resolution` | Existing `ProjectDatabaseGroupAnalysis` when an archive has several database groups |
| `unsupported` | `unable_to_detect`, `unsupported_source`, or `unsupported_file_extension` |
| `invalid` | Empty, malformed, unreadable, bad resolution, or archive safety rejection |
| `database_type_mismatch` | Current type and detected type fail the existing family rule |
| `file_too_large` | Text or archive size exceeds the active upload capability |
| `project_parse_failure` | Existing `ProjectImportErrorCode`, with `parserLocation` `local` or `remote` |

`ready.source` is `{ kind }` only. The adapter does not send `compareViews`, `viewsSupported`, `source.databaseType`, or capabilities. The backend derives view comparison from `kind`.

There is no separate capability-failure status. If `uploadCapabilities` is omitted, `resolveUploadCapabilities()` supplies either the fetched public limits or `CONSERVATIVE_UPLOAD_SAFETY_CEILING`. A source that exceeds that ceiling is `file_too_large`. The adapter does not define its own numeric limits.

### Source mapping

Declared once in `source-kinds.ts`. `ef_core` is not a source.

| Detection | `source.kind` | Normalizer | Parser |
| --------- | ------------- | ---------- | ------ |
| SQL DDL | `sql` | `importSchema()` | local |
| PostgreSQL dump | `postgres_dump` | `importSchema()` / dump reader | local |
| DBML | `dbml` | `importSchema()` | local |
| Diagram JSON | `diagram_json` | `importDiagramFromJson()` | local |
| Metadata JSON | `metadata_json` | `importSchema()` | local |
| Laravel | `laravel` | `importProject()` | remote |
| Prisma | `prisma` | `importProject()` | local |
| EF Core | `entity_framework_core` | `importProject()` | remote |
| Rails | `rails` | `importProject()` | local |
| Django | `django` | `importProject()` | remote |
| Drizzle | `drizzle` | `importProject()` | local |

`postgres_dump` stays `postgres_dump`. Drizzle stays `drizzle`. DBML stays `dbml`.

Diagram JSON does not go through `importSchema()`. `importDiagramFromJson()` keeps the database type embedded in the file. `diagramFromJSONInput()` remaps entity ids and the root id, and drops `schemaVersion` because it is not part of the in-memory `Diagram`. Semantic comparison does not use those ids.

Metadata JSON is the same `importSchema()` path as the create and existing-diagram importers. It has no database type of its own, so the diagram uses the current diagram type and optional edition.

DBML also uses the current diagram type. Project import passes that type as `targetDatabaseType`, which is the existing project-import rule.

Ordinary SQL is imported with the resolved source dialect as both source and target, so a MySQL script compared with a MariaDB diagram stays MySQL on the incoming diagram.

A PostgreSQL dump is PostgreSQL before the family check. The incoming diagram type is `postgresql`, including when the current diagram is CockroachDB. A dump is not a dialect the caller chooses.

### Ambiguity

The adapter returns the existing analysis objects. It does not pick an ambiguous candidate.

1. Ambiguous SQL: `needs_dialect_resolution`. The next call passes `resolution.sourceDialect`. A dialect outside the candidate list is `invalid_dialect_resolution`. A candidate outside the current family is `database_type_mismatch`.
2. Ambiguous project: `needs_project_resolution`. The next call passes `resolution.projectCandidateKey`.
3. Several database groups: `needs_database_group_resolution`. The next call passes `resolution.databaseGroupId`.

A single detected project and a single database group continue without a resolution value.

### Database compatibility

The check is `areDialectsCompatibleForMatch()`:

| Pair | Result |
| ---- | ------ |
| Same type, including `generic` and `oracle` | Allowed |
| MySQL ↔ MariaDB | Allowed |
| PostgreSQL ↔ CockroachDB | Allowed |
| Every other pair | `database_type_mismatch` |

`generic` has no family. The current diagram type is not rewritten. Family-compatible ordinary SQL can still be `needs_dialect_resolution` when the existing analyzer reports more than one candidate; after an explicit compatible choice, the incoming diagram keeps that dialect.

The backend Compare endpoint repeats this check. Frontend detection is not trusted.

### Upload limits

Text byte length and `file.size` use `uploadCapabilities.schema.textMaxBytes`. ZIP compressed size and `ArchiveReader.open(file, capabilities.archive)` use the archive limits, including path traversal, depth, and entry caps. Project import file count and per-file limits stay inside `importProject()`.

## Out of scope for M1

- semantic diff
- compare or apply HTTP
- source adapters (completed later in M5)
- persistence, broadcasts, and undo
- autosave changes
- merge UI

M5 prepares the incoming source only. The wizard, Compare client, and Apply client are still unbuilt. Next milestone: M6 Wizard Shell + Step 1.
