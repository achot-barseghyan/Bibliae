// Contenu éditorial distant : textes hébergés sur GitHub (dépôt public),
// modifiables sans passer par une mise à jour d'app. Voir src/services/remoteContent.ts
// pour le mécanisme de récupération/cache, et remote-content/README.md pour le
// guide de publication des fichiers.

const GITHUB_USER = 'achot-barseghyan';
const GITHUB_REPO = 'bibliae-content';
const GITHUB_BRANCH = 'main';

export const REMOTE_CONTENT_BASE_URL = `https://raw.githubusercontent.com/${GITHUB_USER}/${GITHUB_REPO}/${GITHUB_BRANCH}`;

export const REMOTE_CONTENT_PATHS = {
  accueil: 'accueil.json',
  figures: 'figures.json',
  figureDetails: 'figure-details.json',
  prayers: 'prayers.json',
  saints: 'saints.json',
  rosary: 'rosary.json',
  councils: 'councils.json',
  catechisme: 'catechisme.json'
} as const;
