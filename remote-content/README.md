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
5. Glisse-dépose les 9 fichiers `.json` de ce dossier (pas ce README).
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

## Annoncer une nouvelle version (`app-version.json`)

Ce fichier n'est pas du texte éditorial : il décide si l'app invite à se
mettre à jour. À chaque lancement, l'app compare **sa** version (le
`versionName` d'Android, la version d'iOS) à ce fichier :

- `latest` : la dernière version publiée sur les stores. Si l'app installée
  est plus ancienne, une feuille « Nouvelle version » s'ouvre, avec un bouton
  vers le store et « Plus tard » (l'invitation revient 3 jours après).
- `minimum` : en dessous de cette version, la feuille devient « Mise à jour
  requise » et ne peut plus être fermée. À n'utiliser que si une ancienne
  version ne fonctionne plus.
- `stores.android` / `stores.ios` : liens des fiches. **Le lien iOS est vide
  tant que l'app n'est pas sur l'App Store** ; sans lien, rien ne s'affiche
  sur iPhone.
- `news` : 2 ou 3 nouveautés (`glyph`, `title`, `body`). Glyphes sûrs :
  ✦ ✶ ❧ ✿ ◈ ❡ ⁂ ✚ † ⌕ — éviter ✝ ↗ ★ ☀ etc., affichés en émoji sur iPhone.

**Ordre à respecter :** publier d'abord la version sur les stores (et
attendre qu'elle soit disponible), **puis** changer `latest` ici. Sinon les
utilisateurs sont envoyés vers une fiche qui propose encore l'ancienne
version.

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
  id de figure. **C'est le seul fichier qui peut aussi ajouter** : une clé
  pour une figure qui n'a pas encore de fiche dans l'app (ex. `"abel"`,
  `"cain"`, `"ponce-pilate"`) crée sa fiche, sans nouvelle version. L'id doit
  exister dans `src/data/figures.ts`. Copier la structure d'une fiche
  existante (`alternateNames`, `reperes`, `biography`, `timeline`, `places`,
  `churchTeaching`, `relatedFigures`) ; tous les champs sont facultatifs,
  on peut publier une fiche partielle et la compléter ensuite. Hors ligne,
  au tout premier lancement, ces fiches ajoutées restent vides jusqu'à ce
  que l'app ait pu télécharger le fichier une fois.
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
