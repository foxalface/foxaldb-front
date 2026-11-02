# Analyse visuelle — Liquid Glass POC (FoxalDB)

> **M-LG.2.1** : comparatif quatre panneaux (réfraction backdrop / clone) — procédure et critères G1–G5 dans [VISUAL_COMPARE.md](./VISUAL_COMPARE.md).

## Implémentation initiale (`filter` sur le shell entier)

Le filtre SVG `foxaldb-liquid-glass-benchmark-filter` était appliqué sur le conteneur **incluant texte et champs**.

### Ce qui est réellement réfracté

| Zone | Réfraction / distorsion optique | Flou arrière-plan |
|------|--------------------------------|-------------------|
| Fond du canvas (points React Flow) | **Non** via `feDisplacementMap` seul | Partiel via `backdrop-blur` (glass-css / faible sur liquid) |
| Relations (edges) derrière une table | **Non** déformées par SVG filter on node | Floues si `backdrop-filter` actif sur couche vitre |
| Contenu interne (titres, types SQL) | **Oui** — distorsion du `SourceGraphic` du nœud | N/A |
| Autres tables sous la table du dessus | Flou possible (backdrop) | Pas de displacement réaliste |

**Conclusion :** ce n’était **pas** un Liquid Glass « Apple » (réfracter l’**arrière-plan** en gardant la typographie nette). C’était une distorsion stylistique du **contenu de la table**.

### Confusion réfraction contenu vs arrière-plan

- **Réfraction du contenu** : `filter: url(#…)` + `feDisplacementMap` sur l’élément filtré → déplace les pixels déjà peints **de cet élément** (y compris texte si non isolé).
- **Réfraction / verre de l’arrière-plan** : nécessite une couche vitre **sans texte**, avec `backdrop-filter` et/ou moteur type Aave / `liquid-glass-web-react` qui échantillonne le DOM **déjà composé derrière** la lentille.

Le POC v2 sépare **couche vitre** (backdrop + filtre optionnel) et **couche contenu** (`z-10`, sans filtre) pour se rapprocher du comportement cible.

### Pendant le drag

- React Flow translate le nœud via transform ; la couche vitre suit le shell.
- Tant que le filtre reste sur la vitre seule, le texte reste net en drag.
- L’arrière-plan visible à travers la vitre **change** pendant le drag : un vrai verre liquide devrait mettre à jour la réfraction (coût GPU / invalidation filtres). Safari recalcule mal les filtres mis en cache par ID — `liquid-glass-web-react` régénère l’ID filtre sur WebKit.

## `liquid-glass-web-react` et React Flow

| Critère | Évaluation |
|---------|------------|
| Réfraction « live DOM » | Oui, via carte de displacement + `feDisplacementMap` sur région lentille |
| Texte net | Oui si le contenu UI est **au-dessus** ou **hors** de la zone filtrée ; la lentille couvre l’arrière-plan, pas les labels |
| Une lentille par table × 300 | **Problématique** : N filtres SVG / N maps, invalidation au pan/zoom du viewport |
| Alternative moteur | `LiquidGlassEngine` (DOM pur) + `setPosition` sans re-render React — adapté drag **d’une** lentille, pas 300 instances identiques |
| React Flow interactions | Wrapper **interne** au nœud table (couche vitre + children) sans dupliquer le canvas ; pas de second React Flow |
| Edges | Non réfractés par la lentille **sauf** s’ils sont peints **sous** la vitre dans le même stacking context (cas React Flow : oui pour edges sous le nœud, non pour edges au-dessus) |

**Architecture plausible pour FoxalDB (étape suivante, hors scope intégration) :**

1. Par table : shell en 2 couches (vitre + contenu), moteur displacement partagé ou instancié léger.
2. Global : option « qualité auto » qui passe en glass-css pendant pan/zoom (dégradation temporaire), liquid au repos — contrôle utilisateur du mode avec bannière si fallback actif.
3. Valider Safari sur taille de filtre (tables ~224–450 px larg → OK ; filtre viewport entier → risque).

## M-LG.1.1 — Transparence peu visible (cause)

### Cause principale

1. **Couche contenu opaque** : le header utilisait `bg-slate-200` / `dark:bg-slate-900` sur toute la largeur, **par-dessus** la vitre (`z-10`), masquant presque toute la transparence.
2. **Shell classic-like** : modes glass conservaient un fond quasi opaque perçu (peu de contraste avec le fond React Flow neutre — points gris sur slate).
3. **Filtre SVG** : `feDisplacementMap` ne travaille que sur le **SourceGraphic de la couche vitre** (le div semi-transparent), pas sur le composite canvas + edges derrière le nœud. Le flou « verre » vient de `backdrop-filter`, pas de la réfraction SVG.

### Corrections POC (v1.1)

- Header / lignes **transparents** en modes `glass-css` et `liquid-svg` ; classic inchangé.
- Vitre plus lisible (`backdrop-blur-xl`, alpha augmentée, shell sans `bg` opaque).
- **Démo visuelle isolée** (`LiquidGlassVisualDemo`) : fond gradient + grille claire + 4 tables superposées + edges blancs sous les nœuds — **hors** surface de mesure (`data-benchmark-measurement-surface`).

### Ce qui est réellement « réfracté »

| Élément | glass-css | liquid-svg |
|---------|-----------|------------|
| Points / grille React Flow derrière la table | Floutés via **backdrop-filter** | Idem |
| Edges sous le nœud (z-index) | Floutés, visibles si fond contrasté | Idem + ondulation **du tint vitre**, pas des edges |
| Texte / champs | Net (couche sans filtre) | Net |
| Réfraction type Apple (déformation optique du fond) | **Non** | **Non** (limitation CSS/SVG filter sur HTML) |

### Piste pour vraie réfraction (hors scope, sans npm)

Capture périodique ou texture du fond (canvas snapshot, moteur displacement sur image du fond composé), lentille sans texte — comme documenté pour `liquid-glass-web-react`. Un simple `feDisplacementMap` sur un div HTML **ne** rééchantillonne **pas** le backdrop déjà composé.


**GO conditionnel**, pas GO pur :

- **100–300 tables** : Liquid **complet** simultané sur **chaque** shell est **NO-GO** raisonnable (coût filtre × N, invalidation pan/zoom).
- **GO** pour : mode utilisateur **classic / glass léger / liquid**, avec **fallback automatique temporaire** (pan/zoom → glass-css) et métriques P95, sans plafond arbitraire de tables — la décision vient des mesures et du matériel.
