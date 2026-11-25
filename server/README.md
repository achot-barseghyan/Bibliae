# API du quiz du jour

Comptes, tirage quotidien, réponses chronométrées et classements, sur PostgreSQL.

## Lancer en local

```bash
cp .env.example .env        # remplir POSTGRES_PASSWORD et JWT_SECRET
docker compose up -d --build
curl http://localhost:3000/health
```

Au démarrage, l'API applique les migrations (`sql/`) et recopie la banque `data/questions.json` dans la table `questions`.

Côté app : `npm run dev` à la racine (API attendue sur `http://localhost:3000`).
Émulateur Android : `VITE_QUIZ_API_URL=http://10.0.2.2:3000`. Appareil USB : `adb reverse tcp:3000 tcp:3000`.

## E-mails

Les codes de vérification partent par SMTP (`SMTP_URL`, `MAIL_FROM` dans `.env`).
Sans `SMTP_URL`, ils arrivent dans Mailpit : http://localhost:8025.
En production, renseigner le SMTP d'un fournisseur (Brevo, OVH, Scaleway…) avec un domaine
d'envoi configuré (SPF, DKIM), sinon les messages finissent en indésirables.

## Règles

- Adresse e-mail à confirmer (code à 6 chiffres, 15 min, 5 essais) avant de jouer.

- 20 questions par jour (heure de Paris), les mêmes pour tous : tirage déterministe, figé dans `daily_quizzes`.
- Une partie par compte et par jour. Le serveur sert les questions une à une et chronomètre lui-même (20 s, plus 2 s de marge réseau) : les bonnes réponses ne quittent jamais le serveur avant la réponse du joueur.
- Barème : 100 points par bonne réponse, plus jusqu'à 50 de bonus de vitesse, plus 20 à partir de 3 bonnes réponses d'affilée.
- Classements : jour, 7 derniers jours, depuis toujours, sur les parties terminées.

## Routes

| Méthode | Route | |
|---|---|---|
| POST | `/auth/signup` | `{ pseudo, email, password, avatar }` → `{ token, user }` |
| POST | `/auth/login` | `{ email, password }` → `{ token, user }` |
| POST | `/auth/verify/send` | (re)envoie le code à 6 chiffres (1 par minute) |
| POST | `/auth/verify` | `{ code }` → confirme l'adresse e-mail |
| GET | `/me` | compte connecté (avec `email`, `emailVerified`) |
| DELETE | `/me` | suppression du compte et de ses parties |
| GET | `/quiz/today` | état du jour : partie, série, joueurs, temps restant |
| POST | `/quiz/today/next` | sert la question en cours (lance son chrono) |
| POST | `/quiz/today/answer` | `{ index, pick }` (`pick = -1` : temps écoulé) |
| GET | `/quiz/today/review` | correction, une fois le quiz terminé |
| GET | `/leaderboard?period=day\|week\|all` | top 30 et position du joueur |

## Tests

```bash
npm install && npm test && npm run typecheck
```
