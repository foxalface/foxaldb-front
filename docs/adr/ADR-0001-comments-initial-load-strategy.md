# ADR-0001 — Initial Comment Loading Strategy

## Status

Accepted

## Date

2026-07-19

---

## Context

FoxalDB introduces realtime comments synchronized through Laravel broadcasting and Laravel Echo.

When a diagram is opened, two asynchronous mechanisms become available:

1. The initial HTTP request loading all persisted comments.
2. The realtime subscription receiving newly created, updated, or deleted comments.

A theoretical race condition exists if a realtime event occurs while the initial HTTP request is still in progress.

Several implementation strategies were considered.

---

## Decision

The project intentionally uses a simple lifecycle:

1. Subscribe to realtime comment events.
2. Load comments through the REST API.
3. Apply subsequent realtime events directly to the reducer.

No temporary buffering of realtime events is implemented during the initial HTTP loading phase.

---

## Rationale

This approach was selected because it provides the best balance between simplicity, maintainability and practical correctness.

Introducing an event buffer would require:

- temporary storage;
- replay ordering;
- merge semantics;
- additional testing;
- more lifecycle complexity.

At the current scale of the project, the probability of losing a comment during the initial loading window is considered extremely low.

The application already supports:

- manual reload;
- automatic reconnect synchronization.

These mechanisms provide sufficient recovery for the MVP.

Following the KISS principle, the simpler architecture was intentionally preferred.

---

## Consequences

### Advantages

- Small implementation.
- Easy to understand.
- Easy to test.
- Fewer lifecycle states.
- Lower maintenance cost.

### Limitations

A comment created during the very small window between the backend snapshot used by the HTTP request and the application of the HTTP response could theoretically be missing until the next authoritative reload.

No known production issue currently demonstrates that this situation occurs in practice.

---

## Alternatives Considered

### A. HTTP load before realtime subscription

Rejected.

Realtime events occurring during the HTTP request would always be missed.

---

### B. Temporary realtime event buffering

Rejected.

Although technically robust, the additional complexity is currently disproportionate compared to the expected benefit.

---

### C. Full reconciliation buffer

Rejected.

Maintaining an event replay queue and replaying buffered operations after the initial load would significantly increase implementation complexity and testing requirements.

---

## Future Reconsideration Criteria

This decision should be re-evaluated only if production evidence shows that users are regularly losing comments immediately after opening diagrams.

If such evidence appears, introducing a temporary realtime event buffer during the initial loading phase should be reconsidered.