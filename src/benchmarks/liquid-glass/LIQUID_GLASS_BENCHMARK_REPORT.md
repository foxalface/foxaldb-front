# Liquid Glass benchmark — FoxalDB (POC v2)

See also: [VISUAL_ANALYSIS.md](./VISUAL_ANALYSIS.md), [BROWSER_PROTOCOL.md](./BROWSER_PROTOCOL.md).

## GO / NO-GO — Liquid Glass on **all** tables

| Verdict | Scope |
|---------|--------|
| **NO-GO** | Liquid **complet** (displacement actif) sur **100–300** tables **simultanées** au pan/zoom, sur matériel grand public, en conservant 60 FPS réels. |
| **GO conditionnel** | Offrir **3 modes utilisateur** (classic / glass léger / liquid) + **fallback temporaire** auto (ex. liquid → glass-css pendant pan/zoom) + retour au mode choisi au repos, **sans plafond fixe de tables** — la décision repose sur métriques locales (P95, long tasks) et signalement UI. |
| **NO-GO visuel actuel** | Le POC `liquid-svg` ne reproduit **pas** la réfraction Apple de l’arrière-plan (edges + canvas) ; il combine `backdrop-blur` + distorsion SVG **sur la couche vitre** uniquement. |

## Architecture proposée (étape suivante)

1. **Couche vitre** par table (backdrop + moteur displacement type `liquid-glass-web-react` / `LiquidGlassEngine`).
2. **Couche contenu** (fields, PK icons) **sans filtre**.
3. **Orchestrateur qualité** (pas une préférence utilisateur dans ce POC) : mesure P95 pan/zoom → fallback temporaire + toast « rendu réduit pendant la navigation ».
4. **Safari** : filtres SVG `userSpaceOnUse`, rotation ID filtre (pattern lib), tests manuels obligatoires.
5. **Pas** de duplication du canvas React Flow ; une instance, N nœuds enrichis.

## Modes de rendu

| Mode | Mécanisme |
|------|-----------|
| classic | Shell opaque production-like |
| glass-css | `backdrop-blur` + fill semi-transparent sur couche vitre |
| liquid-svg | Couche vitre : blur + `feDisplacementMap` (POC inline, 0 deps) |

**Candidat npm (non installé)** : `liquid-glass-web-react`.

## Scénarios benchmark

- Tables : 20 / 100 / 200 / 300  
- Champs : light (6) / medium (10) / heavy (14)  
- Relations : none / sparse / dense  
- Overlap : 8 tables superposées  
- Phases : idle, pan, zoom, drag, overlap, modal (overlay translucide)

## Mesures

- rAF FPS + P50/P95 frame times, long tasks, heap Chrome (`performance.memory`)
- Warmup **800 ms** avant chaque run
- Matrice statistique : pan × **3** itérations + zoom × **2**, ordre des modes permuté
- Agrégats : médiane FPS, écart-type FPS, médiane P95, σ P95

## Anomalie Liquid SVG @ 20 tables (~93,5 FPS pan)

**Cause probable (session v1)** : première mesure **sans warmup** + coût **première activation** filtre SVG/turbulence sur couche vitre fraîchement montée ; artefact amplifié quand le rAF est plafonné (~120 Hz) — une chute ~25 % peut refléter quelques frames > 16 ms au démarrage.

**Mitigation v2** : warmup 800 ms, 3 répétitions, permutation ordre modes. Si médiane pan ≈ plafond refresh et σ faible → anomaly **non reproductible** comme régression stable.

## Limitations métriques

- Pas de timers GPU / pas de `EXT_disjoint_timer_query` dans le POC.
- FPS = min(cap écran, coût CPU/GPU compositor).
- Nœuds benchmark **proches** mais pas identiques à `TableNode` (pas de merge/diff/presence).

## Mesures de référence

Les mesures **production build** doivent être prises après `npm run build && npm run preview` sur `/dev/benchmarks/liquid-glass` — voir section « Execution log » remplie après run local.

## Fichiers

`frontend/src/benchmarks/liquid-glass/**`, `frontend/src/pages/dev/liquid-glass-benchmark-page.tsx`, `frontend/src/router.tsx`.

## Execution log

_(Complété après build production + run navigateur dans cette session.)_
