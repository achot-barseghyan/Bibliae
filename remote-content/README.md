# Contenu distant de Bibliae

Ces fichiers contiennent tout le texte éditorial de l'app (accueil, figures,
prières, saints, chapelet, conciles, Catéchisme). L'app va les chercher au
lancement sur GitHub ; les modifier ici met l'app à jour **sans nouvelle
version sur les stores**.

## Mise en place (une seule fois)

1. Va sur https://github.com/new (connecté avec le compte `achot-barseghyan`).
2. Nom du dépôt : `bibliae-content` — **Public** — ne coche aucune case
   d'initialisation (pas de README, pas de .gitignore).
3. Clique "Create repository".
4. Sur la page du nouveau dépôt (vide), clique "uploading an existing file".
5. Glisse-dépose les 8 fichiers `.json` de ce dossier (pas ce README).
6. En bas, écris un message de commit (ex. "Contenu initial") et clique
   "Commit changes".

C'est tout : la branche s'appelle `main` par défaut, ce que l'app attend déjà
(voir `src/config/remoteContent.ts`).

## Modifier un texte plus tard

1. Va sur `github.com/achot-barseghyan/bibliae-content`.
2. Clique sur le fichier à modifier (ex. `accueil.json`).
3. Clique l'icône crayon (Edit this file), en haut à droite du fichier.
4. Change le texte entre guillemets (ne touche pas aux clés à gauche des
   `:`, ni aux guillemets, virgules ou accolades — sinon le fichier devient
   invalide et l'app ignorera tout le fichier, pas juste le champ cassé).
5. En bas, "Commit changes" (directement sur `main`).
6. Les utilisateurs verront le changement dans les ~24h suivant l'ouverture
   de l'app (le contenu est mis en cache et rafraîchi en tâche de fond) —
   ou immédiatement s'ils rouvrent l'app avec une connexion internet après
   la modification.

## Ce qui n'est PAS modifiable ici

- **Les images** : elles restent embarquées dans l'app (mise à jour de
  l'app requise pour en changer), sauf si tu mets une URL d'image complète
  (`https://...`) dans un champ `image` — l'app affichera alors cette image
  au lieu de l'image locale, mais elle ne sera plus visible hors-ligne.
- **La structure du canon biblique** (`src/data/bible.ts`) et **le texte
  biblique lui-même** : non concernés par ce système, ils ne changent pas.
- **Ajouter une figure entièrement nouvelle** (id absent des fichiers
  locaux) : possible pour du texte, mais elle n'aura pas d'image propre —
  à réserver aux corrections/compléments de figures existantes.

## Format de chaque fichier

- `accueil.json` — texte de la page d'accueil + les 10 figures en vedette
  (par `id`).
- `figures.json` — un tableau, un objet par figure, identifié par `id`
  (voir `src/data/figures.ts` pour la liste complète des ids).
- `figure-details.json` — biographies/chronologies détaillées, une clé par
  id de figure.
- `prayers.json` — les prières de l'Église, par `id`.
- `saints.json` — l'intercession des saints, groupée par catégorie
  (`key`), chaque situation identifiée par `id`.
- `rosary.json` — `mysterySets` (les 4 séries de mystères) et `prayers`
  (les prières fixes du chapelet).
- `councils.json` — les conciles cités dans les fiches, par `id`.
- `catechisme.json` — les paragraphes du Catéchisme cités par les fiches
  « Les bases », par `id` (le numéro de paragraphe, ex. `"1131"`). Le texte
  fourni par défaut avec l'app est une reformulation à vérifier et corriger
  face au texte officiel ; c'est justement ce fichier qui permet de le
  remplacer sans mise à jour de l'app.

Dans tous les cas : seuls les champs que tu modifies sont pris en compte,
le reste garde sa valeur d'origine. Tu peux donc, par exemple, ne laisser
dans `figures.json` que `{ "id": "adam", "mentions": 30 }` pour corriger
un seul chiffre sans retoucher tout le fichier.
