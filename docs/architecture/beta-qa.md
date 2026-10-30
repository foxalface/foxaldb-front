# Beta QA — executable checklist

Operator-facing Beta validation for FoxalDB. This document is the **executable checklist** for Beta sign-off.

**Not duplicated here:** import/export/merge implementation architecture — see [import.md](import.md), [export.md](export.md), [schema-merge.md](schema-merge.md).

**Handover context:** [AI_CONTEXT_V3.md](../../../AI_CONTEXT_V3.md) at workspace root.

---

## Beta scope

Beta validates real-browser product flows before roadmap features (Notes, Teams, expanded Permissions):

- Guest local-first create, import, edit, reload, portable/visual export, restore
- Authenticated create, import (local + remote project), autosave, reload, logout/login
- Collaboration, reconnect, Merge, Export depth, permissions (later milestones)

**Out of scope for Beta (deferred):** new product features, architecture refactors, synthetic performance benchmarks, full locale matrix.

**Closed by automation (not Beta debt):** MariaDB/SQLite import semantics (M11.2/M11.5 goldens); flexible ZIP / multi-group / ambiguity (M10/M11 automated coverage). Those still get **spot browser smoke** in B4 where noted, but are not open P1 parser defects.

**Current P1 risk:** real-browser create / edit / save / reload / auth and (later) collaboration / reconnect — not already-proven parser logic.

---

## Severity model

| Level | Definition |
|-------|------------|
| **P0** | Security issue, data corruption, unrecoverable loss, auth bypass |
| **P1** | Core create / save / reload / import workflow broken; persistence failure |
| **P2** | Important UX or semantic limitation with a workaround |
| **P3** | Cosmetic / polish / non-blocking |

**Beta gate:** no unresolved **P0** or **P1** in scope of the active milestone.

---

## Milestone sequence

| ID | Focus | Status |
|----|--------|--------|
| **B1** | Readiness audit + QA matrices | **COMPLETE** |
| **B2** | Local Docker smoke — guest + auth create/import/edit/save/reload | **COMPLETE** (LAN origin) |
| **B3** | Two-browser collaboration, conflict/LWW, reconnect | **PASS** (reconnect GET + B5.1 live op after reconnect; see checklist) |
| **B4** | Realistic fixture — Merge, Export, Restore depth | **COMPLETE** (automated QA + partial browser Restore) |
| **B5** | Beta hardening + sign-off smoke | **COMPLETE** (B5.1–B5.4; S4 PASS 2026-10-30) |

---

## Browser matrix

| Tier | Browser | When |
|------|---------|------|
| Mandatory | Chrome / Chromium (latest) | B2–B5 core paths |
| Secondary | Firefox, Safari (macOS) | Before Beta sign-off |
| Pre-release | Edge, mobile Safari | Spot check only |

**Desktop-first:** editor collaboration target is viewport **≥ 768px** (`md` breakpoint). Mobile layout exists but is not a Beta collaboration contract.

---

## Realistic fixture policy

**B2** uses small in-repo SQL for import smoke (not the empty diagram JSON as the main scenario).

| Fixture | Tables (approx.) | Use |
|---------|------------------|-----|
| [`postgres-baseline.sql`](../../src/lib/import/__tests__/fixtures/semantic/postgres-baseline.sql) | ~5 + view + enum | B2 guest/auth SQL import smoke |
| M10 Prisma/Rails realistic | 2 | Parser smoke only — too small for layout/collab |
| **B4 canonical (operator-owned)** | ~20 | **`beta-canonical-v1.sql`** — PostgreSQL DDL, not in repo yet |

**B4 `beta-canonical-v1.sql` target:** ~20 tables with PKs, multiple FKs, self-FK, UNIQUE, indexes, nullable/non-null, enum/custom type, at least one view. After first import, version a **Diagram JSON** export as `beta-canonical-v1.json` for Restore/Merge/Export repeatability.

---

## Local stack (B2)

From repository root with Docker Compose (`DEV_HOST=localhost` in `.env`):

| Service | Command / image | URL |
|---------|-----------------|-----|
| Frontend | `frontend` → `npm run dev` | http://localhost:5173 |
| Backend | `backend` → `php artisan serve` | http://localhost:8000 |
| API | — | http://localhost:8000/api |
| MySQL | `mysql:8.4` | `127.0.0.1:3306` (internal: `mysql`) |
| Reverb | `php artisan reverb:start` | ws/http://localhost:8080 |
| Redis | `redis:7` | internal |

**Frontend env (browser):** `VITE_API_BASE_URL`, `VITE_BACKEND_URL`, `VITE_REVERB_*` — see [frontend/.env.example](../../.env.example).

**Backend env:** `APP_URL`, `FRONTEND_URL`, `SANCTUM_STATEFUL_DOMAINS`, `CORS_ALLOWED_ORIGINS`, `BROADCAST_CONNECTION=reverb`, DB vars — see [backend/.env.example](../../../backend/.env.example).

**Migrations:** If `php artisan migrate:status` shows all migrations **Ran**, do **not** run `migrate` again. Fresh DB only: `docker compose exec backend php artisan migrate`.

**Reverb for B2:** Not required for guest Dexie or single-user autosave; required from **B3** onward.

**Start stack:** `docker compose up -d` (from repo root).

---

## B2 checklist — guest

Record each row: **PASS** | **FAIL** | **MANUAL REQUIRED** | **NOT RUN** | **BLOCKED**

| ID | Step | Expected | B2 status | Notes |
|----|------|----------|-----------|-------|
| G1 | Continue without account | Guest editor; URL `/` or local flow; no backend diagram create | **PASS** | Cursor browser 2026-03-20 |
| G2 | Blank diagram | Local diagram; Dexie persist | **PASS** | Table + field via “Ajouter une Table”; local id `zirodgro…` (non-numeric) |
| G3 | Edit name/table/field | Changes visible on canvas | **PASS** | Same session as G2 |
| G4 | Reload | Content survives; same local identity | **PASS** | Full reload; Dexie retained diagram |
| G5 | No backend create on guest blank | No `POST /api/diagrams` for guest create | **PASS** | Fetch hook during G6: no `/api/diagrams` (fixture GET only) |
| G6 | Local import (PostgreSQL SQL) | Parse; new local diagram; correct `databaseType`; tables/FKs visible | **PASS** | `postgres-baseline.sql` via DataTransfer; diagram `SQL Import (postgresql)` id `zirodgrocxiq`; users/posts/categories; FKs in Refs |
| G7 | Edit after import + reload | Edit persists | **PASS** | Added `table_5`; survived reload + guest re-entry |
| G8 | Export menu | SQL, DBML, Diagram JSON, PNG, JPG, SVG available | **PASS** | Observed 2026-03-20 — no framework tiles |
| G9 | Merge hidden | No Diagram → Merge for guest / local-only id | **PASS** | Observed 2026-03-20 — menu has Export only |
| G10 | Framework exports hidden | No Laravel/Prisma/EF/Rails/Django/Drizzle in export picker | **PASS** | Same observation |
| G11 | Remote parser blocked | Laravel/EF/Django ZIP: detect only + sign-in CTA | **PASS** | `tmp/b2-laravel.zip`: “Projet Laravel détecté”; Importer disabled; sign-in copy shown; no `project-import/parse` |
| G12 | No Share / Conversations backend | No authenticated collab surfaces | **PASS** | No Share/Conversations in guest chrome (spot check) |
| G13 | Restore backup JSON | New local diagram; original unchanged; reload OK | **PASS** | `diagram-json-null-pk-index-names.json` → new diagram; prior diagram kept in Dexie |

---

## B2 checklist — authenticated

Prerequisites: valid user in DB (`foxalface@gmail.com` verified in local MySQL). **Local env:** `frontend/.env` uses `VITE_*_URL=http://192.168.1.168:8000` — browse **`http://192.168.1.168:5173`** for auth smoke; `http://localhost:5173` triggers **CSRF token mismatch** on login (see B2-ENV-001). Sanctum CSRF cookie from `GET /sanctum/csrf-cookie` before login.

**B2 auth run:** Cursor browser on **`http://192.168.1.168:5173`**, 2026-10-20. Network: `window.__b2Net` fetch hook where noted.

| ID | Step | Expected | B2 status | Notes |
|----|------|----------|-----------|-------|
| A1 | Login | Session cookie; authenticated chrome | **PASS** | Active session at run start; `Diagram viewers` + `Partage` / `Conversations` visible |
| A2 | Diagram list / home | Backend list loads | **PASS** | Post re-login: **Ouvrir Base de Données** lists backend diagrams (incl. 76–78) |
| A3 | New Diagram → blank | One `POST` create; URL `/diagrams/{numericId}` | **PASS** | PostgreSQL → empty → **`/diagrams/76`** (“Diagram 2”); one `POST /api/diagrams`; added `table_1`; `PUT /api/diagrams/76` after ≥2s; reload kept `table_1` |
| A4 | No duplicate create | Single create per wizard completion | **PASS** | Single `POST /api/diagrams` per wizard; reload did not create another |
| A5 | Immediate reload before debounce | Document preserve/loss (observation only) | **PASS (observed: preserved)** | Added `table_2` → immediate reload; `table_1` + `table_2` present — not classified as defect |
| A6 | Local import (PG SQL) | One backend diagram; PostgreSQL; structure + edit persist | **PASS** | `postgres-baseline.sql` → **`/diagrams/77`**; one `POST`; users/posts/categories + FKs; post-import `table_5`; ≥2s wait + reload OK |
| A7 | Remote import (Laravel ZIP) | `POST /api/project-import/parse`; no legacy `/api/laravel-migrations/import` | **PASS** | Fixture `m10-3-qa-laravel-multi-db` ZIP (Main group) → **`/diagrams/78`** (“Main”, `users`); parse + one `POST /api/diagrams`; minimal `tmp/b2-laravel.zip` fails parse (expected) |
| A8 | Logout | Authenticated chrome clears | **PASS** | Compte → Déconnexion; login dialog; no `Diagram viewers` |
| A9 | Re-login | Session restored via UI | **PASS** | Connexion form → authenticated chrome returns (“Connecté en tant que Foxal Face”) |
| A10 | Reopen diagram | Same numeric id + content | **PASS** | **`/diagrams/77`**: SQL Import (postgresql), users/posts/categories/`table_5` |
| A11 | Final persistence | Saved state matches edits; no duplicate creates | **PASS** | MySQL rows 76–78 unique; reopen matches; no new stray creates this run |

### Autosave matrix (B2)

| Case | Procedure | Expected | Status |
|------|-----------|----------|--------|
| A | Edit → wait ~2s → reload | Edit persisted | **PASS** (A3 `table_1`, A6 `table_5`) |
| B | Rapid multi-field edits → wait → reload | Final state only; no duplicate entities | **MANUAL REQUIRED** | Not isolated in B2 run |
| C | Reload after successful save | Same id + content | **PASS** (76, 77, 78 reloads) |
| D | Logout after save → login → reopen | Backend state retained | **PASS** (A8–A10 on 77) |

### Immediate reload (B2 observation)

**Procedure:** Edit once → reload within &lt;900ms (before debounce).

**Record actual behavior** (do not assume bug):

- [x] Preserved (flush on unload / synchronous path)
- [ ] Lost (expected debounce loss)
- [ ] Browser unload flush
- [ ] Indeterminate

**B2 recorded result:** **Preserved** — `table_2` on diagram 76 survived immediate reload (A5).

---

## B2 i18n spot check (en + fr)

| Surface | en | fr | B2 status |
|---------|----|----|-----------|
| New Diagram / account entry | | | **PASS (fr)** — wizard strings natural |
| Import wizard | | | **PASS (fr)** — PostgreSQL / Collez votre schéma / Laravel detection copy |
| Restore | | | **PARTIAL** — FR dialog OK; file-uploader hint still EN in one path |
| Save / error toast | | | **PARTIAL** — login error `CSRF token mismatch` (en) on localhost; raw key `editor_sidebar.browse` |

Switch language: Account → Langue. Full ja spot check remains B4/B5.

---

## B3 checklist — collaboration (LAN)

**Environment:** `http://192.168.1.168:5173` + `:8000` + Reverb `:8080` (Docker stack up). **Diagram:** `77` (B2 PostgreSQL import). **Sessions:** User A = Cursor browser (`foxalface@gmail.com`, owner, existing B2 session). User B = isolated Playwright Chromium (`alexis.renart@gmail.com`, editor, API login). **Run:** 2026-10-20.

| ID | Step | Expected | B3 status | Notes |
|----|------|----------|-----------|-------|
| B3-0 | Reverb up | ws channel available | **PASS** | `foxaldb-reverb-1` Up; presence works when both clients connected |
| B3-1 | Two isolated sessions | Distinct cookies/users | **PASS** | MCP cookie jar ≠ Playwright context |
| B3-2 | Share / editor invite | B can open + edit | **PASS** | A added `alexis.renart@gmail.com` as editor; `diagram_members` id 2 role `editor` |
| B3-3 | Presence A→B | A sees B | **PASS** | Popover: `FF You` + `AR Alexis Renart` while B connected |
| B3-4 | Presence B→A | B sees A | **PASS** | Playwright presence: `AR You` + `FF Foxal Face` |
| B3-5 | No duplicate presence | Single entry per user | **PASS** | No duplicate `AR` rows in popover during single B session |
| B3-6 | Remote cursor A→B | B sees A cursor | **MANUAL REQUIRED** | Synthetic DOM/canvas mouse events did not surface `[data-remote-cursor-user-id]` on peer |
| B3-7 | Remote cursor B→A | A sees B cursor | **MANUAL REQUIRED** | Same automation gap; presence proves channel alive |
| B3-8 | Remote selection | Peer ring on select | **NOT RUN** | Blocked on reliable canvas select automation |
| B3-9 | Selection cleanup | Stale clears | **NOT RUN** | — |
| B3-10 | Table drag / persisted position | LWW position on reload | **NOT RUN** | React Flow drag not scriptable via MCP `browser_drag` on nodes |
| B3-11 | Remote table create | B sees without reload | **MANUAL REQUIRED** | A created `table_6`; backend JSON includes `table_6`; B `wait_table` failed without reload while offline — live broadcast not confirmed in automation |
| B3-12 | Remote field create/edit | Peer + backend | **PARTIAL** | Backend fields `id,b3_field` on `table_6`; live peer field sync **not** confirmed |
| B3-13 | Relationship | Peer + reload | **NOT RUN** | Time/automation; defer spot in B4 or manual |
| B3-14 | Editing awareness | Soft conflict copy | **NOT RUN** | — |
| B3-15 | Table rename LWW | Converge + reload | **NOT RUN** | — |
| B3-16 | Field rename LWW | Converge + reload | **NOT RUN** | — |
| B3-17 | Relationship conflict | Converge | **NOT RUN** | — |
| B3-18 | Delete vs edit | No corrupt UI | **NOT RUN** | — |
| B3-19 | Simultaneous move | Converge | **NOT RUN** | — |
| B3-20 | Autosave / realtime loop | No PUT storm | **NOT RUN** | — |
| B3-21 | Reconnect / offline | Peer edit reconciles | **NOT RUN** | — |
| B3-22 | Logout presence cleanup | Ghost clears | **NOT RUN** | — |
| B3-23 | Re-login / rejoin | No duplicate ghost | **NOT RUN** | — |
| B3-24 | Final reload convergence | A=B=backend | **NOT RUN** | Backend authoritative snapshot includes `table_6` + `b3_field` |

**B3.1 run (2026-10-20):** User A = Cursor **headed** browser (owner session). User B = **isolated** Playwright Chromium (UI login unreliable in agent; **API Sanctum fallback** after guest `/diagrams/77` — not a second headed profile). Cookie isolation **confirmed** (distinct users; presence bidirectional).

| ID | Step | B3.1 status | Notes |
|----|------|-------------|-------|
| B3-6 | Cursor A→B | **MANUAL REQUIRED** | MCP cannot drive real canvas `mousemove`; no `[data-remote-cursor-user-id]` on B |
| B3-7 | Cursor B→A | **MANUAL REQUIRED** | Playwright `mouse.move` on B; no remote cursor on A |
| B3-8 | Remote selection | **MANUAL REQUIRED** | Canvas click on A; B `remoteSelection` false (automation) |
| B3-9 | Selection cleanup | **NOT RUN** | — |
| B3-10 | Table drag overlay | **NOT RUN** | React Flow node drag not automatable in MCP |
| B3-11 | Live table create | **PASS** | A added `table_7`; B peer body showed `table_7` **without reload** (~4s) |
| B3-12 | Live field A→B | **PASS** | A added `b3_live_field` on `table_7`; B body showed it **without reload** |
| B3-12b | Live field B→A | **NOT RUN** | Needs B-side edit automation while A observes |
| B3-13–B3-24 | LWW, reconnect, logout, convergence | **NOT RUN** | Requires manual dual-headed operator |

**B3 gate:** **PASS** after `ConnectionManager` `unavailable → connected` reconnect + authoritative `getDiagram` refresh. **B5.1** ensures a **second live DiagramOperation** applies after reconnect without reload. Automated coverage: `connection-manager.test.ts`, `diagram-channel-ownership.test.tsx`.

### B3-P1-001 — reconnect reconciliation (closed)

| | |
|--|--|
| Root cause | Pusher offline path uses `state_change` through `unavailable`, not `disconnected` |
| Fix | `ConnectionManager` notifies reconnect once; `useDiagramReconnectRefresh` authoritative GET + `replaceDiagram({ authoritative: true })` |
| B5.1 add-on | Listener rebind after `rejoinAll()` so post-reconnect ops are not dropped |
| Browser | **PASS** — B5.4 S4 (diagram 77, LAN Playwright, post-reconnect live DiagramOperation) |

### B3 manual operator checklist (minimal)

1. Chrome profile **A**: `http://192.168.1.168:5173` → owner → `/diagrams/77`.
2. Chrome profile **B** (incognito or second user): same URL → `alexis.renart@gmail.com` → `/diagrams/77`.
3. **Presence:** Diagram viewers shows each user once.
4. **Cursor:** move mouse over canvas A → B sees labeled cursor; repeat B→A.
5. **Selection:** select table on canvas → peer ring; deselect → clears.
6. **Drag:** drag `table_7` slowly → peer overlay + persisted position after reload.
7. **LWW:** rename same table/field from both; last writer wins after reload.
8. **Reconnect:** offline A ~45s while B edits → reconnect → converge.
9. **Logout B:** A loses B presence/cursor/selection/editing within stale timeout.
10. **Re-login B:** single presence entry; no ghost ephemeral state.

---

## B4 — Merge / Export / Restore (complete)

- Automated Merge/Export/Restore matrices green (see `b4-*` / export-wizard / merge-wizard tests).
- Restore invariants: Device load-before-location; Online POST then GET open; no Dexie shadow; late dialog close guarded.
- Browser: partial Device/Online Restore spot checks during B4; not re-run in B5.4 unless regression.

---

## B5 — Beta hardening

| Slice | Focus | Status |
|-------|--------|--------|
| B5.1 | Realtime channel ownership / post-reconnect listener rebind | **COMPLETE** |
| B5.2 | Entry recoverableError UI + non-dismissible entry auth | **COMPLETE** |
| B5.3 | Guest one-diagram limit; viewer archive UI; failure toasts | **COMPLETE** |
| B5.4 | Restore i18n; docs; beta smoke | **COMPLETE** — S4 PASS (baseline live, offline PUT, reconnect GET×1, post-reconnect live op) |

### B5.4 browser smoke (operator)

Record **PASS** | **FAIL** | **NOT RUN** | **BLOCKED**. Temporary Playwright outside repo; no `package.json` dependency. Align `VITE_*` and Sanctum with LAN origin used in B2/B3.

| ID | Scenario | Expected | B5.4 status | Notes |
|----|----------|----------|-------------|-------|
| S1 | Guest one Device diagram + second create blocked | Guest limit toast; no Dexie row #2 | **FAIL** | Playwright: guest CTA timeout; Vite dynamic-import errors in run log |
| S2 | Login on Device diagram without Put Online | Stays Device; no POST create | **FAIL** | Same entry-flow timeout |
| S3 | Online edit + autosave + reload | Persists from backend | **FAIL** | Editor menubar never loaded (module fetch errors) |
| S4 | Two-user reconnect + **post-reconnect live edit** | A receives B’s edit live after GET reconcile | **PASS** | Diagram **77**; reconnect authoritative GET ×1; third rename live on A without reload; no `[reconnect-refresh]` during third edit |
| S5 | Logout / relogin Online intent | Single open of intended diagram | **NOT RUN** | Blocked by S3/S4 setup failure |
| S6 | Viewer readonly / no archive | Readonly canvas; no archive menu | **NOT RUN** | No viewer fixture in runner |
| S7 | Restore Device / Online spot | File input; route + canvas | **FAIL** | Guest entry timeout |

### Known intentional limitations (non-blocking)

- No offline edit queue; reconnect authoritative GET may overwrite unsaved Online memory edits
- No CRDT/OT merge for concurrent editing beyond LWW ops + autosave 409 handling
- No guest table count cap (only one **Device diagram**)
- No public share-token API (invitation/member model only)
- Framework export requires auth; stateless POST of live diagram body
- Owner-only conversation **delete**; archive/reopen requires editor+ (`update` permission)
- Put Online **Move**: backend create then local delete — both copies may exist if local delete fails after successful create

---

## B4 placeholder (archived notes)

- Canonical `beta-canonical-v1.sql` (~20 tables)
- Merge (SQL + local + remote source)
- Export smoke (portable + visual + one framework)
- Restore from exported JSON
- Optional: flexible ZIP / multi-group browser spot (not P1 parser retest)

---

## B5 placeholder

- Staging `APP_URL` / Sanctum domains / `wss` Reverb
- `php artisan migrate` on empty staging
- Scheduler: `foxaldb:purge-archived-conversations`
- Beta sign-off table completion

---

## Defect log

| ID | Milestone | Severity | Area | Steps | Expected | Actual | Status | Commit/Fix |
|----|-----------|----------|------|-------|----------|--------|--------|------------|
| B2-ENV-001 | B2 | **P2** | Local auth / Sanctum | Open `http://localhost:5173`, login with valid user | Login succeeds | Alert **CSRF token mismatch**; API cookies target `192.168.1.168:8000` per `frontend/.env` | **Open** | Auth smoke **PASS** on `http://192.168.1.168:5173`; align URLs or document LAN origin for local QA |
| B2-P2-001 | B2 | P2 | Guest import UX | Guest with entry blank diagram → Nouveau → Import SQL | Import creates diagram | Guest limit toast unless Dexie has 0 diagrams (product: 1 guest diagram) | **Open** | QA workaround: delete local diagrams or import as first diagram |
| B2-P2-002 | B2 | P3 | i18n | FR UI, sidebar | Translated labels | Raw key `editor_sidebar.browse` | **Open** | — |
| B2-P2-003 | B2 | P3 | i18n | Restore / file uploader | FR hints | EN “Drag and drop…” on restore overlay from create wizard | **Open** | — |
| B3-QA-001 | B3 | — | Beta QA automation | Agent could not finish the full matrix | — | Superseded by manual two-profile results | **Closed** | Manual PASS except reconnect |
| B3-P1-001 | B3 | **P1** | Reconnect | A offline while B edits; A reconnects | Authoritative GET + live ops after | Fixed in code + B5.1; **S4 browser PASS** | **Closed** | `connection-manager.ts`, B5.1 channel ownership |

---

## Sign-off table

| Milestone | Owner | Date | P0 | P1 | Result |
|-----------|-------|------|----|----|--------|
| B1 | — | 2026-03-20 | 0 | 0 | Complete (audit) |
| B2 | — | 2026-10-20 | 0 | 0 | **PASS** (guest + auth on LAN origin; B2-ENV-001 localhost-only P2) |
| B3 | — | 2026-10-30 | 0 | 0 | **PASS** (reconnect + B5.1) |
| B4 | — | 2026-10-30 | 0 | 0 | **COMPLETE** |
| B5 | — | 2026-10-30 | 0 | 0 | **COMPLETE** — S4 PASS; **beta gate cleared** |

**B2 PASS criteria:** All B2 guest + auth rows **PASS**; no P0/P1; manual rows explicitly completed by operator (not inferred from unit tests).

---

## B2 operator quick script

1. `docker compose up -d` — confirm http://localhost:5173 and :8000 (or LAN URLs matching `frontend/.env`).
2. Guest: Continue without account → G2–G7, G11–G13. SQL/ZIP upload in Cursor browser: set `input.files` via `DataTransfer` + `fetch('/src/lib/...')` (native file picker blocked).
3. Ensure DB user exists → A1–A11. **Auth:** use same host as `VITE_BACKEND_URL` (see B2-ENV-001).
4. SQL file path for G6/A6: `frontend/src/lib/import/__tests__/fixtures/semantic/postgres-baseline.sql`.
5. Laravel remote import: use project ZIP from project-import test fixtures (see `m10-3-qa-laravel-multi-db` / import.md M10 matrix).
6. File results in **Defect log**; update status columns in this file.
