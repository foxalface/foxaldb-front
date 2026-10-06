# Schema merge

Product architecture for Schema Merge. M1 adds the shared contract only. No merge UI is implemented.

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

## Out of scope for M1

- semantic diff
- compare or apply HTTP
- source adapters
- persistence, broadcasts, and undo
- autosave changes
- merge UI
