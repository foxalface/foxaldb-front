# Schema merge

Product architecture for Schema Merge. M1–M9 (V1) are complete; M10 visual preview is in progress: shared contract, source adapter, two-step wizard (Source → Result), dependency-aware selection, Compare/Apply clients, autosave flush before Compare, authoritative Apply replacement with one local undo, M8.1 full-document optimistic concurrency (`content_hash` / `baseContentHash`, 409 `stale_content`), and peer refresh on `apply_schema_merge`. Actions → Merge is available for an authenticated editor of a persisted backend diagram.

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

The wizard reuses existing shells and patterns:

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

The result UI implements dependency-closed selection:

- selecting an operation also selects its prerequisites
- clearing a prerequisite also clears operations that depend on it

The backend Apply check is independent. It rejects a selection that is not dependency-closed. It does not add missing operations. Operation ids are opaque; the client does not decode them.

## Upload capabilities

M3.1 is complete. `backend/config/uploads.php` is the upload authority, and `GET /api/capabilities/uploads` publishes the public limits. Source preparation and the Compare client read those capabilities. The wizard does not hardcode byte limits.

`uploads.schema_merge.payload_max_bytes` is 16 MiB. `GET /api/capabilities/uploads` exposes it as `schemaMerge.payloadMaxBytes`. The frontend capability type includes that field. The Compare client rejects a body larger than `schemaMerge.payloadMaxBytes` before the request. The 512 KiB framework-export budget is not this limit.

The M5 source adapter reads `schema.textMaxBytes` for pasted text and text files, and `archive` for ZIP inspection. It does not apply `schemaMerge.payloadMaxBytes`.

## M5 source adapter

Status: complete. Entry point: `prepareSchemaMergeSource()` in `frontend/src/lib/schema-merge/prepare-schema-merge-source.ts`.

M5 prepares one incoming source. It does not add the wizard, an Actions menu item, autosave, realtime refetch, undo, or Apply. The Compare client is M6.

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

## M6 wizard shell

Status: complete. Dialog: `frontend/src/dialogs/merge-wizard/`. Opener: `openMergeWizardDialog()`. The dialog is registered on `DialogProvider` and stays closed until that opener runs.

M6 registered the dialog and left the Actions menu closed. M8 exposes it. There is no temporary feature flag.

### Step 1

The only product step is SOURCE. The user pastes schema text or imports one file. One hidden file input accepts `.sql`, `.dbml`, `.json`, and `.zip`. ZIP bytes become an archive input. Other files become a text-file input. Paste and file selection replace each other, so only one source is active.

Detection goes through `prepareSchemaMergeSource()`. The wizard does not reimplement detection. A ready source shows the existing detection summary. Ambiguous SQL uses `DialectResolutionPanel` and stores `sourceDialect`. An ambiguous project uses the existing project panel and stores `projectCandidateKey`. Several database groups use `ProjectDatabaseGroupPanel` and store `databaseGroupId`. The first group is not selected automatically. A database mismatch uses `DialectMismatchPanel` and does not offer changing the current diagram type. Compare stays disabled until the adapter status is `ready`.

`includeDeletions` defaults to `false`. Turning it on shows a short warning: a partial source may propose deletions for elements it does not contain. There is no second confirmation.

Footer actions are Cancel and Compare. Step 1 has no Back button.

### Compare request

`compareSchemaMerge()` posts `POST /api/diagrams/{diagramId}/merge/compare`.

```
{
  incomingDiagram,
  includeDeletions,
  source: { kind }
}
```

The client rebuilds that body. It does not send the current diagram, `viewsSupported`, `source.databaseType`, capabilities, or a base hash. A guest or local-only diagram is not compared. The response is decoded as `baseContentHash`, `baseUpdatedAt`, `viewsCompared`, and `operations`. An empty `operations` array is a successful result.

On success the wizard stores `incomingDiagram`, `source`, `includeDeletions`, and the Compare response, then switches its internal step to RESULT. RESULT is a state boundary for the later review UI. It is not a product screen. Closing and reopening returns to SOURCE and clears the source, resolutions, deletion option, errors, and Compare result. A later Back from RESULT can keep the source without reparsing it.

### Autosave

Compare uses the persisted diagram. M6 called Compare without waiting for the 900 ms debounce. M8 flushes that save before Compare. The flush contract is described under M8.

## M7 result UI

Status: complete. The result step renders the Compare response already stored by M6. It does not call Compare again and does not reparse the source. Apply is owned by the dialog, not by replaying operations in the result step.

The parent keeps `incomingDiagram`, `source.kind`, `includeDeletions`, and the Compare response, including `baseContentHash` and `baseUpdatedAt`. The hash is not shown. `viewsCompared` comes from the response. The UI does not infer it from `source.kind`.

### Sections

Operations are grouped only by `table`, `field`, `relationship`, and `view`, in that order. Order inside a section is the backend order. Indexes, checks, custom types, and dependencies stay on their owning operations.

All four sections are shown when the comparison has operations. An empty section shows a compact empty state. If `viewsCompared` is false and the view section is empty, the section explains that the source format cannot compare views reliably. Those views are not listed as deletions.

If `operations` is empty, the step shows “No differences found”. That is a successful comparison. Checkboxes are omitted and Merge stays disabled. When views were not compared, that explanation is still shown.

Sections start expanded.

### Change rows

Each row uses an icon and a word:

| Change | Color | Icon |
| ------ | ----- | ---- |
| add | green | plus |
| modify | blue | pencil |
| rename | amber | arrow |
| delete | red | minus |

Labels come from semantic identity. The default schema is omitted unless the same name appears in another schema. Relationship rows use endpoints, for example `users.id → posts.user_id`. A field rename shows both names, for example `users.name → full_name`. Operation ids, entity ids, and raw JSON are not shown.

Attribute changes use one formatter. One or two changes are written as a short line. More than two become a property count. Indexes, checks, dependencies, and composite relationship columns are summarized, not dumped.

### Selection

Every operation starts selected, including deletions when the user asked for them. Selection is a set of operation ids. The operation objects stay immutable.

Selecting an operation also selects its `dependsOn` prerequisites, including prerequisites in other sections. Clearing an operation also clears operations that depend on it, including dependents in other sections. Section checkboxes follow the same closure: checked, unchecked, or indeterminate. There is no global select-all.

A cycle, a self-dependency, or a missing prerequisite in client data shows an analysis error instead of walking the graph. The backend graph is still authoritative at Apply time.

The footer count is “Merge N changes”. N = 0 disables the control. M8 enables it when the selection is non-empty, the dependency graph is valid, Apply is not already running, and the diagram is a persisted backend diagram. The click posts `POST /merge/apply`.

### Back

Back returns to SOURCE and keeps the pasted text or file, dialect, project, and database-group resolutions, `includeDeletions`, and the latest ready preparation. The Compare response stays cached until the next successful Compare, which replaces the result and selects every new operation.

### Actions

Actions → Merge is shown after Export and before Delete. The label is `menu.actions.merge` (“Merge...” / “Fusionner...”). It is visible when the user is authenticated, the diagram id is a persisted backend id, the editor is not readonly, and `diagramAccess.can_edit` is not false. Guests, local-only diagrams, and viewers stay hidden. The menu uses that existing frontend permission state and does not call the backend to decide visibility. The click runs `openMergeWizardDialog()`.

## M8 apply integration

Status: complete.

### Autosave flush

`useDiagramAutosave` still debounces for 900 ms. The reusable control is `flushDiagramAutosave()` in `frontend/src/lib/diagram-autosave/diagram-autosave-controller.ts`. It is not Merge-specific.

- Nothing pending and nothing in flight resolves immediately, with no request.
- A pending debounce is cancelled and that save runs immediately.
- An in-flight save is awaited. If a newer editor snapshot arrived during that request, that newer snapshot is persisted before flush resolves.
- A save error rejects flush.

Compare submission is: source still ready, pending state, `await flushDiagramAutosave()`, then Compare, then RESULT. Flush runs only on Compare submit. A flush failure stays on SOURCE and shows `merge_wizard.errors.autosave_failed`. Compare is not sent. The pending Compare control covers both the flush and the Compare request. There is no separate Saving step and no timer wait.

### Apply request

`applySchemaMerge()` posts `POST /api/diagrams/{diagramId}/merge/apply`.

```
{
  baseContentHash,
  incomingDiagram,
  includeDeletions,
  source: { kind },
  selectedOperationIds,
  clientId
}
```

`baseContentHash`, `incomingDiagram`, `source`, and `includeDeletions` are the values retained from Compare. `selectedOperationIds` follows Compare operation order filtered by the selected set. `clientId` is `getClientId()`, the same realtime session id used by diagram operations. The body does not include operation objects, `dependsOn`, the current diagram, `viewsSupported`, `source.databaseType`, or a client-computed hash.

The response decoder requires `resultContentHash`, `updatedAt`, `content`, `appliedOperationIds`, and `summary`. `content` is normalized with the existing diagram decoder.

### Errors

`stale_comparison` keeps the source, resolutions, and deletion option, clears the Compare result and selection, and returns to SOURCE with “Diagram changed. Compare again.” There is no automatic Compare or Apply.

`incomplete_selection` uses the same recompare path. The client does not add missing prerequisites.

`429` keeps the result and the selection so the user can retry later. Other analysis and payload errors stay on the result and do not change the diagram. `401` and `403` keep the data and disable retry. While Apply is in flight, Back, checkboxes, section toggles, Merge, and dialog close are disabled. A second click does not send a second Apply.

Apply error classes (no raw backend message in UI):

| Class | Codes / HTTP | Behavior |
| ----- | ------------ | -------- |
| A. Re-Compare | `stale_comparison`, `incomplete_selection` | Return to Source, clear Compare result |
| B. Retry on Result | `analysis_failed`, `payload_too_large`, `malformed_diagram`, `database_type_mismatch`, `unsupported_source`, 429 | Keep selection |
| C. Permission | 401, 403 | Disable retry |
| D. Internal | 500, unexpected | Generic failure |

Source-step errors (`unable_to_detect`, `ambiguous_source`, `malformed_archive`, and adapter failures) are handled before Compare and use `merge_wizard.errors.*` only.

### Authoritative replacement

A successful Apply calls `replaceDiagram(content, { updateHistory: true, authoritative: true })`. The frontend does not replay `DiffOperation` values. Backend entity ids and layout in `content` become the editor state in one transition. `load_diagram` does not emit collaboration operations.

`authoritative: true` cancels any pending autosave, writes the returned diagram to local storage, and sets the autosave baseline to that content. The replacement does not PUT the same content back. Later local edits still autosave. Undo and redo of this step are not marked authoritative, so they persist through the normal autosave path.

A pending debounce from before Apply is cancelled before the replacement, so it cannot overwrite the merged document. An HTTP save already on the wire cannot be aborted.

### M8.1 full-document autosave concurrency

Status: complete.

Normal `PUT /api/diagrams/{id}` autosaves send `baseContentHash` from the latest server-issued hash. Diagram load (`GET`) exposes `content_hash`, SHA-256 of the exact persisted `diagrams.content` string. The client does not compute that hash from the decoded `Diagram` object.

After a successful autosave, the response `content_hash` becomes the next base. Queued saves during an in-flight request use the hash returned by the previous successful write, not the older base.

Merge Apply and remote `apply_schema_merge` refresh set the autosave token to `resultContentHash` (or the refetched `content_hash`). The next legitimate edit, including Undo back to a pre-merge snapshot after a local Apply, autosaves with that post-merge base. That Undo is valid when the server still matches the merged document.

`409 stale_content` means the server rejected a full-document write. The autosave controller does not retry the same payload. It refetches once. If the editor still matches the failed snapshot, it replaces locally with the authoritative document. If the user has newer local edits, only the hash advances so the next save uses the current server revision.

Schema Merge Compare/Apply keep `stale_comparison`. Granular diagram operations do not update `diagrams.content` immediately; they do not advance the full-document hash until a later autosave or another authoritative write.

### Local undo

Successful replacement records one `replaceDiagram` undo entry. Its snapshot is the editor diagram from before the replacement, which is the state flushed before Compare while the modal blocked further edits. Apply failure, a stale comparison, and a remote refresh record no undo entry. There is no inverse Apply request and no per-operation history entry.

### Realtime peer refresh

`apply_schema_merge` is parsed beside diagram operations. It is not a `DiagramOperationAction` and its compact payload is not diagram content. The event carries `resultContentHash`, `updatedAt`, `userId`, `clientId`, and `sentAt`.

The actor’s own `clientId` does not refetch. A remote event cancels a pending autosave, fetches the diagram once, and calls `replaceDiagram` with `authoritative: true`, `updateHistory: false`, and `resetHistory: true`. That refresh does not autosave and does not emit collaboration operations. A second event for the same diagram waits for the in-flight fetch. If a newer `resultContentHash` arrived, the drain fetches again until the newest hash is applied. A local hash that already matches skips the fetch. `updatedAt` is not the concurrency identity.

A peer with unsaved edits is replaced by that authoritative document. The same full-document overwrite already exists for reconnect refresh. Granular diagram operations are unchanged. The pending debounce is cancelled so it cannot PUT the pre-merge snapshot after the refresh. A save already in flight cannot be aborted.

Canvas nodes are rebuilt from the loaded tables. `load_diagram` clears the highlighted custom type. An open sidebar target is layout state and is not cleared by a full load; a missing entity must not be assumed to still exist. Conversations are cleaned on the server. M8 does not add a separate selection cleanup.

## M10 visual preview (complete)

M10 adds a read-only diagram preview on the Merge Result step so reviewers can see topology beside the precise change list. Apply remains backend-authoritative; preview state is never sent on Compare or Apply.

### Compare baseline (`baseDiagram`)

After `flushDiagramAutosave()` and before `compareSchemaMerge()`, the wizard deep-clones the editor diagram into `MergeWizardApplyContext.baseDiagram` via `snapshotMergeBaseDiagram()` (`structuredClone`, same pattern as ChartDB undo snapshots). This snapshot is **client-only**. It is not sent on Compare or Apply. Preview projection uses `baseDiagram`, not the live `currentDiagram`, so edits after Compare do not skew a diff that was computed against the flushed baseline.

### Preview projection

`buildSchemaMergePreview()` in `frontend/src/lib/schema-merge/preview/` takes `baseDiagram`, `incomingDiagram`, Compare `operations`, dependency-closed `selectedOperationIds`, and `viewsCompared`. It returns a synthetic `diagram` plus parallel `decorations` (`add` / `modify` / `rename` / `delete`) keyed by projected entity ids. The preview is non-authoritative: Apply still posts only `selectedOperationIds` and the backend `SchemaMergeApplier` remains the source of truth. Selected deletions stay in the projected diagram so a later canvas pass can render deletion ghosts. No backend or API contract changes.

### M10.2 read-only preview canvas

`MergePreviewCanvas` (`frontend/src/dialogs/merge-wizard/merge-preview-canvas.tsx`) renders a projected diagram inside a **nested** `ReactFlowProvider` that is isolated from the live editor canvas. It reuses real `TableNode` / `RelationshipEdge` via shared `diagram-flow-elements.ts` transforms, with `ChartDBProvider readonly` inside `MergePreviewProviders` (storage, undo stack, and neutral `DiffProvider` only — no realtime, collaboration, export, or keyboard shortcuts).

Interactions are limited to pan, scroll/pinch zoom, and zoom in / zoom out / fit view controls. Node drag, connect, select, delete keys, context menus, and relationship edit popovers are disabled (`readonly` on ChartDB plus explicit React Flow flags).

### M10.3 preview decoration visuals

Merge preview uses the same semantic palette as the Result list (`merge-change-badge` / `merge-preview-visual.ts`): **add** emerald, **modify** sky/blue, **rename** amber, **delete** red. States are never color-only: compact Lucide icons plus accessible labels reuse `merge_wizard.result.change.*`.

Renderer metadata stays on React Flow `node.data.mergePreview` / `edge.data.mergePreview` only; persisted `Diagram` JSON is unchanged. `DiffProvider` remains separate (neutral in preview); merge decorations do not reuse editor diff states.

- **Tables / views:** semantic border/ring and header badge; user `table.color` strip is preserved.
- **Fields:** row accent via `TableNodeField` optional `mergePreviewChange`; future values come from the projected diagram.
- **Relationships:** stroke color/weight; delete uses dashed red styling; ghosts stay rendered.
- **Delete ghosts:** selected table, field, and relationship deletions remain visible with reduced emphasis (opacity / strike-through on names where appropriate). Parent table delete dominates: field-level delete decorations are suppressed on that node to avoid noise.
- **Invariant:** M10.1 maps at most one decoration per entity id (`add` | `modify` | `rename` | `delete`); rename wins when rename operations also carry attribute changes.

### M10.4 Result workspace integration

The Result step with operations uses a **two-column** workspace (stacked below the large breakpoint): **Changes** (existing accordion + dependency-closed `useMergeOperationSelection`) and **Preview** (`buildSchemaMergePreview` → `MergePreviewCanvas`). The dialog widens only for Result with `operations.length > 0`; Source and zero-difference Result keep the normal wide wizard size (`~48rem`).

`applyContext.baseDiagram` and the current `selection.selected` set feed `buildSchemaMergePreview()`; preview updates immediately on checkbox changes. **No preview → selection** feedback. Apply still posts only `selectedOperationIds` (and existing Compare fields); preview diagram/decorations are never sent.

When every operation is deselected, preview shows the frozen **baseDiagram** with **no** decorations (not incoming, not empty). Selected deletes render as ghosts; deselecting a delete operation restores normal base styling. Initial `fitView` runs once when the preview panel has measurable size (`ResizeObserver`); pan/zoom are preserved across selection toggles (manual Fit only afterward). Zero-difference and analysis-error Result states do not mount the preview workspace.

### M10.5 polish and cross-highlight

Desktop Result uses roughly **36% Changes / 64% Preview** (`lg:grid-cols-[minmax(280px,36%)_minmax(0,1fr)]`). Below the large breakpoint the workspace stacks with a capped Changes scroll region so the preview keeps useful height.

**List → preview cross-highlight** (hover and keyboard focus on a Result row) is preview-only metadata:

- `MergeResultStep` holds `highlightedOperationId` separately from `useMergeOperationSelection`.
- `resolvePreviewHighlightTarget(operation, projectedDiagram)` maps the hovered operation to projected `tableId` / `fieldId` / `relationshipId` (reuses M10 identity and preview ids; no DOM inference).
- `buildMergePreviewHoverMaps()` drives optional focus rings and light dimming on unrelated nodes/edges; semantic add/modify/rename/delete styling is unchanged.
- Highlight does **not** change selection, Apply payload, viewport, or `buildSchemaMergePreview` inputs.

**Preview → list cross-highlight** (pointer hover on decorated preview entities) uses the same `highlightedOperationId` state:

- Decorations carry preview-only `operationId` metadata (not persisted, not sent on Apply).
- Table header/badge hover highlights a **table-level** operation only when the table itself is decorated; field rows highlight their own field operation.
- Relationship path, interaction band, and Merge indicator share one hover region and call `onHighlightOperation(operationId)` via `MergePreviewHighlightProvider`.
- Highlight does **not** toggle checkboxes, open editor popovers, or change selection.

There is no preview → selection feedback and no auto-pan/zoom on highlight.

### M10.5.3 relationship overlay polish

Merge relationship change indicators (`+` / `−` / modify) render in a fixed `size-5` flex-centered bubble (`merge-preview-change-indicator`, `variant="bubble"`). Indicators offset along the edge normal from the path midpoint using deterministic **lanes** (`assignRelationshipIndicatorLanes()` in `merge-preview-relationship-indicator-lanes.ts`, applied in `buildMergePreviewFlowDecorationMaps()`). Relationship paths and cardinality label geometry are unchanged; only the Merge indicator moves.

On list or preview hover of a relationship operation, the hovered edge receives `mergePreviewHover.foreground` (plus focus/dim on siblings): path stroke, cardinality markers (`selected` marker ids), and the Merge indicator stack above unrelated preview edges. Delete dashed red styling and other semantic colors remain primary; hover adds emphasis only.

### M10.5.1 rename-aware relationship endpoints

Relationship ADD/MODIFY projection resolves semantic endpoints through a **rename alias registry** (`PreviewIdentityRegistry`): selected table/field renames register old and new semantic identities to the same projected entity id. Relationship operations from Compare may still cite pre-rename endpoint names; lookup uses those aliases, not live projected names only. Incoming relationship templates are located with `transformRelationshipIdentityForIncoming()` so incoming diagrams (post-rename names) still match Compare identities. Incoming relationship ids are never authoritative on the preview diagram.

### M10.5.2 collision-free preview placement

Newly added tables/views are positioned with `PreviewTablePlacement` using ChartDB’s `getTableDimensions()` / `calcTableHeight()` (header, field rows, optional “show more” footer). Existing tables/views keep their stored `x`/`y` and act as occupied rectangles. Preview nodes stack in columns to the right of the diagram with `PREVIEW_PLACEMENT_VERTICAL_GAP` between estimated heights; columns wrap when a stack would exceed the existing diagram’s vertical span. Placement is deterministic, preview-only, and never sent on Apply.
