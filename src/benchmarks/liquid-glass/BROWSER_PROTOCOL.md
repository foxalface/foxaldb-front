# Protocole navigateur — Liquid Glass benchmark

URL : `/dev/benchmarks/liquid-glass` (dev et **build production**).

## Prérequis communs

1. Fenêtre pleine largeur ≥ 1280 px.
2. Désactiver extensions qui injectent du CSS global.
3. Noter : OS, machine, écran, DPR, navigateur **version exacte**.
4. Exporter JSON via le bouton **Download JSON** après chaque campagne.

## Automation robuste (M-LG.1)

Ne pas lancer une campagne complète comme premier test. Ne pas utiliser un seul `Runtime.evaluate` bloquant plusieurs minutes.

### Observables

| Global | Rôle |
|--------|------|
| `window.__foxaldbBenchmarkPageDiagnostics` | Montage page, autorun valide, canvas / React Flow |
| `window.__foxaldbBenchmarkCampaignProgress` | `status`, `currentStep`, `totalSteps`, `currentMode`, `currentScenario`, `completedRuns`, `totalRuns` |
| `window.__foxaldbBenchmarkCampaign` | Payload JSON (résultats partiels inclus) |
| `window.__foxaldbBenchmarkCampaignError` | Message d’erreur explicite |
| `window.__foxaldbBenchmarkCancelCampaign()` | Annulation manuelle |

Statuts terminaux : `completed`, `failed`, `cancelled`, `timed_out`.

Paramètre autorun officiel : `?autorun=production-campaign` (pas `product`).

### Procédure recommandée

1. `npm run build && npm run preview -- --host 127.0.0.1 --port 4173`
2. Ouvrir **sans** autorun : `http://127.0.0.1:4173/dev/benchmarks/liquid-glass`
3. Vérifier titre visible et `__foxaldbBenchmarkPageDiagnostics.canvasReady === true` (poll 100 ms, max 15 s).
4. Vérifier absence d’erreur console bloquante.
5. Cliquer **Statistical matrix** (segment court) ou appeler depuis la console :
   - Attendre `__foxaldbBenchmarkCampaignProgress.status === 'running'` puis `'completed'`.
6. Exporter via **Export campaign JSON** ou lire `window.__foxaldbBenchmarkCampaign`.
7. Ne jamais démarrer deux campagnes en parallèle.

### Boucle CDP / automation (exemple)

```javascript
// Poll court (500 ms), timeout global segment ~25 min max pour statistical matrix
async function waitFor(fn, { timeoutMs = 15000, intervalMs = 200 } = {}) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    const v = fn();
    if (v) return v;
    await new Promise((r) => setTimeout(r, intervalMs));
  }
  throw new Error('timeout');
}
await waitFor(() => window.__foxaldbBenchmarkPageDiagnostics?.canvasReady);
document.querySelector('button')?.click(); // prefer data attributes in UI if added
await waitFor(() => ['completed','failed','cancelled','timed_out'].includes(
  window.__foxaldbBenchmarkCampaignProgress?.status
), { timeoutMs: 30 * 60 * 1000 });
return window.__foxaldbBenchmarkCampaign ?? { error: window.__foxaldbBenchmarkCampaignError };
```

## Chrome (référence automatisable)

1. `npm run build && npm run preview -- --host 127.0.0.1 --port 4173`
2. Ouvrir `http://127.0.0.1:4173/dev/benchmarks/liquid-glass`
3. Field density **medium**, relationships **sparse**, overlap **off** sauf phase overlap.
4. **Run full suite** pour chaque mode (classic, glass-css, liquid-svg) à 20 tables.
5. **Statistical matrix** (pan×3 + zoom×2, ordre permuté) — durée ~15–25 min.
6. Optionnel : DevTools → Performance, enregistrer 3 s de pan à 100 tables liquid-svg (trace compositor, pas de score synthétique dans le rapport).

## Safari (manuel obligatoire si non piloté)

1. Servir le **même build** (preview) accessible depuis macOS Safari.
2. Répéter étapes 3–5 Chrome.
3. Vérifier visuellement :
   - Texte net sur `[data-benchmark-table-content]`
   - Arrière-plan (points + edges) **flou** derrière vitre glass-css
   - Distorsion **limitée** sur edges via liquid-svg (attendu POC)
4. Console : avertissements taille filtre SVG (cf. liquid-glass-web-react notes).
5. Tester **drag** d’une table superposée (overlap cluster coché) : pas de clipping fatal.

### Support filtres SVG Safari (checklist)

| Test | Attendu |
|------|---------|
| `filter: url(#foxaldb-liquid-glass-benchmark-filter)` sur couche vitre | Visible, pas de rectangle noir |
| Pan rapide 2 s | Pas de « frozen glass » persistant |
| Zoom 0.5 ↔ 1.5 | Pas de décalage permanent vitre/contenu |

## Firefox (manuel)

1. Même URL preview.
2. Run full suite 20 tables × 3 modes.
3. Vérifier `backdrop-filter` actif (glass-css) et displacement (liquid-svg).
4. Noter si displacement absent (certaines versions partielles) — documenter dans JSON `userAgent`.

## Campagne « anomaly 20 tables »

Pour chaque mode, **5× pan only** à 20 tables en **alternant** l’ordre des modes entre campagnes. Comparer médiane FPS ; liquid-svg ne doit pas rester ~25 % sous classic si warmup actif.

## Ce qu’il ne faut **pas** conclure

- Headless / Vitest : **interdit** pour décision GPU.
- FPS = refresh rate : une médiane ~120 Hz **≠** « gratuit ».
