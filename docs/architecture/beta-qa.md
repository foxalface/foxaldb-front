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
| **B3** | Two-browser collaboration, conflict/LWW, reconnect | NOT STARTED |
| **B4** | Realistic fixture — Merge, Export, Restore depth | NOT STARTED |
| **B5** | Staging deploy smoke + Beta sign-off | NOT STARTED |

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

## B3 placeholder (do not start until B2 has no open P0/P1)

- Two browsers, two users (owner + editor)
- Presence, cursors, selection, table movement overlays
- Editing awareness + conflict warnings (soft; LWW)
- Persistent ops via DiagramOperation (not whispers)
- Reconnect + network loss
- Logout / presence cleanup
- Peer visibility after remote edits

---

## B4 placeholder

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

---

## Sign-off table

| Milestone | Owner | Date | P0 | P1 | Result |
|-----------|-------|------|----|----|--------|
| B1 | — | 2026-03-20 | 0 | 0 | Complete (audit) |
| B2 | — | 2026-10-20 | 0 | 0 | **PASS** (guest + auth on LAN origin; B2-ENV-001 localhost-only P2) |
| B3 | — | | | | Not started |
| B4 | — | | | | Not started |
| B5 | — | | | | Not started |

**B2 PASS criteria:** All B2 guest + auth rows **PASS**; no P0/P1; manual rows explicitly completed by operator (not inferred from unit tests).

---

## B2 operator quick script

1. `docker compose up -d` — confirm http://localhost:5173 and :8000 (or LAN URLs matching `frontend/.env`).
2. Guest: Continue without account → G2–G7, G11–G13. SQL/ZIP upload in Cursor browser: set `input.files` via `DataTransfer` + `fetch('/src/lib/...')` (native file picker blocked).
3. Ensure DB user exists → A1–A11. **Auth:** use same host as `VITE_BACKEND_URL` (see B2-ENV-001).
4. SQL file path for G6/A6: `frontend/src/lib/import/__tests__/fixtures/semantic/postgres-baseline.sql`.
5. Laravel remote import: use project ZIP from project-import test fixtures (see `m10-3-qa-laravel-multi-db` / import.md M10 matrix).
6. File results in **Defect log**; update status columns in this file.
