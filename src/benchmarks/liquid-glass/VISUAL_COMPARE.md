# Visual compare — M-LG.2.1

URL : `/dev/benchmarks/liquid-glass` (section **Visual compare (M-LG.2.1)**).

Cette surface est **hors** campagne perf (`data-benchmark-excluded-from-metrics`). Les JSON exportés par le banc de mesure **ne couvrent pas** ces panneaux.

## Transparence vs réfraction

| Effet | Mécanisme | Edge sous la table |
|-------|-----------|-------------------|
| **Transparence / frosted** | `backdrop-filter: blur()` sur vitre | Flou, pas de courbure optique |
| **Tint ondulé (non réfractif)** | `filter: url(#…)` sur la couche tint | Le tracé SVG de la relation reste droit |
| **Réfraction backdrop (Chromium)** | `backdrop-filter: url(#…)` + `feDisplacementMap` sur le **backdrop composé** | Déformation visible si le filtre est actif |
| **Réfraction clone** | Clone DOM aligné + `filter: url(#…)` (pattern [cocolayuan/liquid-glass](https://github.com/cocolayuan/liquid-glass), MIT) | Déformation du clone (edges inclus si présents dans la scène) |

Un **filtre SVG partagé** (`<defs>` unique) réduit le poids DOM des définitions ; le compositor applique **toujours N** échantillonnages backdrop — ce n’est **pas** un rendu GPU mutualisé.

## Les quatre panneaux

1. **glass-css** — Référence frosted (transparence + blur).
2. **liquid-svg** — POC actuel ; badge **« Non réfractif — tint uniquement »**.
3. **backdrop-chromium** — Réfraction du backdrop réel via SVG + `backdrop-filter` (Chrome / Edge ; panneau « Non disponible » ailleurs).
4. **clone-sync-one-table** — Une table (`compare-hero-table`) avec clone synchronisé ; les autres tables restent en glass-css. Port minimal FoxalDB (pas de dépendance npm).

Scénario commun :

- Fond gradient + grille React Flow.
- Tables partiellement superposées ; hero `compare-hero-table` au-dessus (`zIndex` élevé).
- Relation **`vd-e-through-table`** : `compare-t-left` → `compare-t-right`, tracé sous le hero.
- Texte et handles sur `[data-benchmark-table-content]` **sans** filtre.

## Critères G1 à G5 (gate humaine)

| ID | Critère | GO | NO-GO |
|----|---------|----|-------|
| **G1** | Panneau **backdrop-chromium** (Chrome) : courbure / displacement visible sur **`vd-e-through-table`** sous le hero | Oui | Edge seulement flou |
| **G2** | Panneau **clone-sync** : même test G1 en Safari **ou** Firefox (ou Chrome si clone aligné) | Oui | Clone désaligné ou edge non déformé |
| **G3** | Texte + handles nets sur **tous** les panneaux | Oui | Texte/handle filtré |
| **G4** | Harness campagne inchangé (autorun, statistical matrix, export JSON, 3 modes perf) | Oui | Régression harness |
| **G5** | Aucun composant prod modifié | Oui | Toucher `TableNode` prod |

**G1 et G2 ne sont pas validés par ce dépôt** — observation visuelle humaine obligatoire.

## Procédure Chrome (sans autorun)

1. `npm run build && npm run preview -- --host 127.0.0.1 --port 4173` (ou `npm run dev`).
2. Ouvrir `http://127.0.0.1:4173/dev/benchmarks/liquid-glass` **sans** `?autorun=production-campaign`.
3. Descendre jusqu’à **Visual compare (M-LG.2.1)**.
4. Panneau **backdrop-chromium** : vérifier G1 sur l’edge blanc épais sous `compare.hero_lens`.
5. Panneau **liquid-svg** : confirmer l’absence de déformation de l’edge (tint ondulé OK).
6. Pan 2 s sur un panneau : pas de décalage permanent vitre / contenu.
7. Optionnel : panneau **clone-sync** — drag la table hero, relâcher ; la réfraction doit se realigner (repaint sur `onMove` / pointer up).

## Limitations Safari / Firefox

- **backdrop-chromium** : pas de `backdrop-filter: url(#svg)` fiable → panneau « Non disponible » ou frosted seul.
- **clone-sync** : cible principale cross-browser ; coût sync DOM ; clone `innerHTML` peut être fragile avec React Flow (transforms, layers). Si G2 échoue, documenter dans les notes de session — ne pas bloquer G1 sur Chrome.

## État du prototype clone-sync

- Inspiré de [cocolayuan/liquid-glass](https://github.com/cocolayuan/liquid-glass) (MIT) : SDF displacement map, filter remint, clone aligné au `sceneRef` du panneau.
- **Une** lentille sur **une** table ; pas de duplication du moteur React Flow entier.
- Exclusion des nœuds `[data-clone-sync-lens]` du clone pour éviter récursion.
- Si l’alignement viewport / pan reste incorrect : traiter comme **limitation connue** ; les panneaux 1–3 restent utilisables.

## Comparabilité avec les benchmarks M-LG.1

- Les modes **classic / glass-css / liquid-svg** du canvas de mesure sont **inchangés** pour la campagne.
- Le compare ajoute des modes **hors** `LiquidGlassRenderMode` (`VisualComparePanelId`).
- Ne pas comparer les FPS historiques aux panneaux compare.

## Suite

Après GO visuel (G1 + G3 minimum) → **M-LG.3** (mesures manuelles). Pas de campagne perf avant cette gate.
