# Architecture Decision Records (ADR)

This directory contains the Architecture Decision Records (ADR) for the FoxalDB project.

An ADR documents an important architectural decision, the context in which it was made, the alternatives that were considered, and the rationale behind the final choice.

The purpose of these records is to preserve architectural knowledge over time.

## Index

- [ADR-0001 — Initial Comment Loading Strategy](./ADR-0001-comments-initial-load-strategy.md)
- [ADR-0002 — Discussion Indicator Derivation Architecture](./ADR-0002-discussion-indicator-derivation-architecture.md)

## Rules

- One ADR = one architectural decision.
- ADRs are immutable once accepted.
- If a decision changes later, create a new ADR referencing the previous one instead of editing history.
- ADRs are numbered sequentially:
  - ADR-0001
  - ADR-0002
  - ADR-0003
  - ...
- ADRs are written in English.
- ADRs document architecture decisions only.
- Bugs are fixed immediately and must not become ADRs.
- Technical debt should be avoided whenever possible. If a compromise is accepted, it should be explicitly documented together with the reasons why it was considered acceptable.

## ADR Template

Each ADR should contain the following sections:

- Status
- Context
- Decision
- Consequences
- Alternatives Considered
- Future Reconsideration Criteria
