# Changelog

## [Unreleased]

### À venir
- Tests unitaires et d'intégration pour l'API.
- Pagination / filtrage sur `GET /api/astronomy`.
- Endpoints d'écriture (POST / PUT / DELETE) sur la ressource astronomy.

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
- Validation centralisée des variables d'environnement (`api/config/env.ts`) avec sortie immédiate du processus si `MONGO_URI` ou les origines CORS sont manquantes.
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
  - `galileo-api` : service web Node (région Frankfurt), variables `NODE_ENV` et `MONGO_URI` (cette dernière en `sync: false`).
  - `galileo-frontend` : service statique publiant `dist` avec rewrite `/* → /index.html` et variable `SERVER_URL` pointant sur l'API déployée.

[Unreleased]: #unreleased
[1.0.0]: #100---2026-04-21
