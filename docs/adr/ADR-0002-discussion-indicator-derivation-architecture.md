# ADR-0002 — Discussion Indicator Derivation Architecture

## Status

Accepted

## Date

2026-07-22

---

## Context

FoxalDB already loads all comments for the active diagram and reconciles them
through HTTP and realtime into one comments reducer `byId` map.

Entity UI surfaces (tables, fields, relationships) need a cheap way to know
whether a discussion exists and how many comments it contains.

Requirements for this milestone:

- O(1) lookup per entity;
- no per-entity scan over the full comments collection;
- no new backend endpoint;
- no polling;
- no duplicated reducer state for counts;
- no visible badge yet (architecture foundation only).

---

## Decision

Derive a partitioned indicator index from the authoritative comments `byId`
map whenever that map reference changes.

### Index shape

```ts
interface DiscussionIndicator {
    readonly commentCount: number;
    readonly hasDiscussion: boolean;
}

interface DiscussionIndicatorIndex {
    readonly tables: ReadonlyMap<string, DiscussionIndicator>;
    readonly fields: ReadonlyMap<string, DiscussionIndicator>;
    readonly relationships: ReadonlyMap<string, DiscussionIndicator>;
}
```

Rules:

- rebuild fully in O(C) with a single pass over `byId.values()`;
- do not incrementally maintain a reducer-owned count cache;
- do not add a backend count/indicator endpoint;
- keep the index out of the public `CommentsContextValue`;
- expose access only through specialized hooks:
  - `useTableDiscussionIndicator`
  - `useFieldDiscussionIndicator`
  - `useRelationshipDiscussionIndicator`
- back those hooks with one shared private lookup;
- use `hasDiscussion` (`commentCount > 0`) as the default UI visibility
  semantic;
- keep diagram-level comments outside the three entity maps;
- absent targets have no map entry and resolve to a stable empty indicator.

### Provider wiring

`CommentsProvider` derives the index with `useMemo` keyed on `state.byId`
(and inactivity). It publishes the index through an internal
`DiscussionIndicatorsContext` nested inside the existing provider tree.

This internal context is an implementation detail, not a new domain Provider
and not part of the public comments API.

### MVP rerender contract

Any `byId` mutation produces a new indicator index identity, and all
indicator-hook consumers may rerender. Selective per-key subscriptions are
deferred until measured.

Status/error/generation-only changes that retain the same `byId` reference
must not rebuild the index.

---

## Consequences

### Positive

- O(C) derivation with O(1) entity lookup;
- type-safe partitioning without stringly typed keys;
- future additive indicator metadata can extend `DiscussionIndicator`;
- no drift between counts and authoritative comments;
- no extra backend traffic.

### Trade-offs

- all indicator consumers rerender when the private index identity changes;
- full rebuild on body edits even when counts remain unchanged;
- one internal context implementation detail;
- selective subscriptions deferred until measured.

---

## Alternatives Considered

### A. Per-row `useTargetComments().filter`

Rejected.

This reintroduces per-entity scans over the comments collection and scales
poorly as entity and comment counts grow.

---

### B. Flat string-keyed map (`table:id`, `field:id`, …)

Rejected.

Stringly typed keys lose partition type safety and invite key-protocol bugs.

---

### C. Reducer-maintained count cache

Rejected.

Duplicating derived state in the reducer increases action surface and drift
risk. Full O(C) rebuild from `byId` is simpler and correct.

---

### D. Public raw index on `CommentsContextValue`

Rejected.

The public comments API should stay focused on comment resources and
mutations. Specialized hooks are the intended access path.

---

### E. Backend indicator/count endpoint

Rejected.

The client already holds the full comment set for the active diagram. An
extra endpoint would add traffic and synchronization complexity without
benefit for MVP.

---

### F. Three duplicated hook implementations

Rejected.

Lookup logic must live in one shared private helper.

---

### G. Generic public `useDiscussionIndicator(target)` as primary API

Rejected for this milestone.

Specialized hooks keep call sites typed and avoid constructing generic
target objects in entity UI.

---

## Explicit Non-Decisions

This ADR does not freeze:

- unread/resolved algorithms;
- canvas placement of badges;
- click-to-open discussion behavior;
- aggregate sidebar badge semantics;
- selective subscription optimization (`use-context-selector` or similar).

---

## Future Reconsideration Criteria

Reconsider selective per-key subscriptions only if production profiling shows
indicator-hook rerenders are a measurable cost under realistic collaboration
load.

Reconsider a backend count endpoint only if the client stops loading the full
comment set for the active diagram.
