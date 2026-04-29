# Changelog

Toutes les modifications notables de ce projet sont documentées ici.

Le format s'inspire de [Keep a Changelog](https://keepachangelog.com/fr/1.1.0/) et ce projet suit (de manière souple) les principes du [Semantic Versioning](https://semver.org/lang/fr/).

## [Unreleased]

### Ajouté

#### Back-end (`api/`)
- **Système d'authentification par email** :
  - Schéma et modèle Mongoose `User` (`api/schemas/user.schema.ts`, `api/models/user.model.ts`) : champs `email`, `passwordHash`, `verified`, `verificationToken` / `verificationTokenExpiresAt` ; index unique sur `email`; `strict: "throw"`, `timestamps: true`.
  - Contrôleur `api/controllers/auth.controller.ts` exposant deux actions :
    - `register` — valide l'email et le mot de passe (≥ 8 caractères), hache le mot de passe avec `bcryptjs`, génère un token de vérification (`crypto.randomBytes`), enregistre l'utilisateur via un `findOneAndUpdate` avec `upsert`, envoie l'email de confirmation et annule la création si l'envoi échoue (rollback).
    - `verifyEmail` — recherche le token dans la base, vérifie l'expiration (TTL 24 h) et marque le compte comme vérifié.
  - Routes `api/routes/auth.routes.ts` : `POST /api/auth/register` et `GET /api/auth/verify`.
- **Service mail** (`api/services/mail.service.ts`) : migration de Mailtrap vers **Gmail / Nodemailer** (`nodemailer` + `GMAIL_USER` / `GMAIL_APP_PASSWORD`).
- **Variables d'environnement** (`api/config/env.ts`) : ajout de la validation au démarrage pour `GMAIL_USER` et `GMAIL_APP_PASSWORD`.

#### Front-end (`src/`)
- **Router client léger** (`src/lib/router.ts`) : hook `useRoute` (path + search) et fonction `navigate` basés sur `History API` et `popstate`.
- **Page d'inscription** (`src/pages/register.tsx`) : formulaire email / mot de passe, gestion des états `idle / submitting / success / error`, retour d'erreurs serveur inline.
- **Page de vérification** (`src/pages/verify.tsx`) : lit le token depuis l'URL, appelle `GET /api/auth/verify`, affiche le résultat et propose un retour à l'accueil ou une ré-inscription.
- **Page d'accueil** (`src/pages/home.tsx`) : extraction de la logique de liste astronomique de `App` vers un composant dédié `HomePage`.
- `src/app.tsx` mis à jour pour router entre `HomePage`, `RegisterPage` et `VerifyPage` selon le chemin courant.

### Modifié
- `render.yaml` : `rootDir` passé de `back` / `front` à `./` pour chaque service, reflétant la structure monorepo réelle à la racine.
- `render.yaml` : mise à jour de la valeur `SERVER_URL` du service `galileo-frontend` vers la nouvelle URL publique de l'API déployée.
- `package.json` : bump de version vers `1.0.1` (à valider au prochain release).

### À venir
- Authentification par session / JWT après la vérification d'email.
- Tests unitaires et d'intégration pour l'API.
- Pagination / filtrage sur `GET /api/astronomy`.
- Endpoints d'écriture (POST / PUT / DELETE) sur la ressource astronomy.

## [1.0.1] - 2026-04-21

Itération de stabilisation : renommage de la variable d'environnement Mongo, ajustements des scripts npm pour distinguer dev/prod, réorganisation des dépendances et ajustements Render.

### Modifié
- **Variable d'environnement renommée** : `MONGO_URI` → `MONGODB_URI` dans `api/config/env.ts`, `api/db/mongoose.ts`, `render.yaml`, `README.md` et `CHANGELOG.md`. **Breaking change** côté déploiement : mettre à jour les `.env` locaux et la configuration Render.
- **Scripts npm** (`package.json`) :
  - Ajout de `dev:server` qui lance l'API via `tsx --env-file=.env api/index.ts` (ancien comportement du script `server`).
  - `server` ne charge plus `.env` (`tsx api/index.ts`) afin d'être utilisable en production sur Render où les variables sont injectées par la plateforme.
- **Dépendances** (`package.json`) :
  - `tsx` déplacée de `devDependencies` vers `dependencies` (nécessaire pour le `startCommand: npm run server` de Render sur un build sans devDeps).
  - `mongoose` déplacée de `devDependencies` vers `dependencies`.
- **Configuration** (`api/config/env.ts`) : `PORT` est désormais lu depuis `process.env.PORT` (avec fallback `3001`), requis par l'environnement Render qui impose son propre port.
- `render.yaml` :
  - Suppression du `region: frankfurt` sur le service `galileo-frontend`.
  - Retrait puis réintroduction de `plan: free` uniquement sur le service `galileo-api` (le frontend statique n'a plus de `plan` déclaré).

### Documentation
- `README.md` mis à jour pour refléter le nouveau nom `MONGODB_URI` dans le tableau des variables d'environnement et l'exemple `.env`.

## [1.0.0] - 2026-04-21

Version initiale du projet Galileo (stack MEPN : MongoDB, Express, Preact, Node).

### Ajouté

#### Back-end (`api/`)
- Application Express 5 configurée dans `api/app.ts` avec middlewares `cors` et `express.json`.
- Politique CORS basée sur une liste blanche lue depuis `ALLOWED_ORIGINS` (avec fallback `CLIENT_URL`) ; les requêtes sans `Origin` (curl, health checks) sont autorisées.
- Point d'entrée `api/index.ts` gérant :
  - la connexion à MongoDB via Mongoose au démarrage,
  - l'écoute HTTP sur le port `3001`,
  - un arrêt propre (`SIGINT` / `SIGTERM`) avec déconnexion de la base.
- Validation centralisée des variables d'environnement (`api/config/env.ts`) avec sortie immédiate du processus si `MONGODB_URI` ou les origines CORS sont manquantes.
- Modèle et schéma Mongoose `Astronomy` (`api/schemas/astronomy.schema.ts`, `api/models/astronomy.model.ts`) :
  - interface TypeScript `AstronomyObject`,
  - identifiant `_id` de type `string` fourni par l'utilisateur,
  - `strict: "throw"` pour rejeter les champs inconnus,
  - `versionKey: false` pour désactiver `__v`,
  - collection cible `test`.
- Routes HTTP sous le préfixe `/api` :
  - `GET /api/health` — contrôleur `getHealth` retournant `{ status: "ok" }`.
  - `GET /api/astronomy` — contrôleur `getAllAstronomy` listant tous les documents via `Astronomy.find({}).lean()`, avec gestion d'erreur 500.

#### Front-end (`src/`)
- Application Preact initialisée via `@preact/preset-vite`.
- Composant principal `App` (`src/app.tsx`) qui :
  - récupère la liste des objets astronomiques auprès de `${SERVER_URL}/api/astronomy`,
  - gère les états `loading` / `success` / `error`,
  - annule proprement la requête au démontage via `AbortController`.
- Composant de présentation `AstronomyCard` (`src/components/astronomy-card.tsx`) affichant nom, type, constellation, désignation, classe spectrale, distance, magnitude, masse, rayon, température, indicateur de planètes connues et tags.
- Type partagé côté client `AstronomyObject` (`src/types/astronomy.ts`) miroir de l'interface serveur.
- Typage de `import.meta.env.SERVER_URL` via `src/vite-env.d.ts`.
- Mise en page Tailwind CSS 4 (thème sombre, grille responsive).

#### Configuration & outillage
- `package.json` : scripts `dev`, `server`, `dev:all`, `build`, `preview`, `lint`, `lint:fix`.
- Exécution TypeScript directe du serveur via `tsx --env-file=.env`.
- `vite.config.ts` : plugins Preact + Tailwind, exposition explicite du préfixe d'env `SERVER_URL` en plus de `VITE_`.
- `biome.json` pour le linting et le formatting (script `npm run lint` / `lint:fix`).
- `tsconfig.json`, `tsconfig.app.json`, `tsconfig.node.json` en mode strict.
- `.gitignore` couvrant `.env` et `node_modules/`.

#### Déploiement
- `render.yaml` décrivant deux services Render :
  - `galileo-api` : service web Node (région Frankfurt), variables `NODE_ENV` et `MONGODB_URI` (cette dernière en `sync: false`).
  - `galileo-frontend` : service statique publiant `dist` avec rewrite `/* → /index.html` et variable `SERVER_URL` pointant sur l'API déployée.

[Unreleased]: #unreleased
[1.0.1]: #101---2026-04-21
[1.0.0]: #100---2026-04-21
