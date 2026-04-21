# Galileo

Galileo est un projet de démonstration autour de la stack **MEPN** (MongoDB, Express, Preact, Node). Il expose une API REST qui sert un catalogue d'objets astronomiques stockés dans MongoDB, ainsi qu'un front-end Preact qui affiche ces objets sous forme de cartes.

## Sommaire

- [Stack technique](#stack-technique)
- [Structure du projet](#structure-du-projet)
- [Prérequis](#prérequis)
- [Installation](#installation)
- [Variables d'environnement](#variables-denvironnement)
- [Scripts npm](#scripts-npm)
- [API](#api)
- [Modèle de données](#modèle-de-données)
- [Déploiement](#déploiement)
- [Qualité du code](#qualité-du-code)

## Stack technique

### Back-end
- [Node.js](https://nodejs.org/) avec exécution TypeScript via [`tsx`](https://github.com/privatenumber/tsx)
- [Express 5](https://expressjs.com/) pour le serveur HTTP
- [Mongoose](https://mongoosejs.com/) / [MongoDB](https://www.mongodb.com/) pour la persistance
- [`cors`](https://github.com/expressjs/cors) avec une politique basée sur une liste blanche d'origines

### Front-end
- [Preact](https://preactjs.com/) (hooks) pour l'interface
- [Vite](https://vitejs.dev/) comme bundler / dev server
- [Tailwind CSS 4](https://tailwindcss.com/) pour le style

### Outillage
- [TypeScript](https://www.typescriptlang.org/) en mode strict
- [Biome](https://biomejs.dev/) pour le linting et le formatting
- [`concurrently`](https://github.com/open-cli-tools/concurrently) pour lancer API + front en parallèle

## Structure du projet

```
.
├── api/                        Back-end Express + Mongoose
│   ├── app.ts                  Configuration de l'application Express
│   ├── index.ts                Point d'entrée (connexion DB + listen)
│   ├── config/
│   │   └── env.ts              Lecture et validation des variables d'env
│   ├── db/
│   │   └── mongoose.ts         Connexion / déconnexion MongoDB
│   ├── models/
│   │   └── astronomy.model.ts  Modèle Mongoose compilé
│   ├── schemas/
│   │   └── astronomy.schema.ts Schéma + interface AstronomyObject
│   ├── controllers/
│   │   ├── astronomy.controller.ts
│   │   └── health.controller.ts
│   └── routes/
│       ├── astronomy.routes.ts
│       └── health.routes.ts
├── src/                        Front-end Preact
│   ├── main.tsx
│   ├── app.tsx
│   ├── index.css
│   ├── components/
│   │   └── astronomy-card.tsx
│   ├── types/
│   │   └── astronomy.ts
│   └── vite-env.d.ts
├── index.html
├── vite.config.ts
├── biome.json
├── render.yaml                 Configuration de déploiement Render
├── tsconfig*.json
└── package.json
```

## Prérequis

- **Node.js** >= 20
- **npm** >= 10
- Une instance **MongoDB** accessible (locale ou distante)

## Installation

```bash
git clone <url-du-repo>
cd galileo
npm install
```

Créez ensuite un fichier `.env` à la racine (voir la section suivante).

## Variables d'environnement

Le projet lit ses variables via `--env-file=.env` côté serveur et via Vite côté client.

### Back-end (`.env`)

| Variable          | Obligatoire | Description                                                                 |
| ----------------- | ----------- | --------------------------------------------------------------------------- |
| `MONGO_URI`       | Oui         | Chaîne de connexion MongoDB (inclure la base cible).                        |
| `ALLOWED_ORIGINS` | Oui*        | Liste d'origines autorisées par CORS, séparées par des virgules.            |
| `CLIENT_URL`      | Oui*        | Alternative à `ALLOWED_ORIGINS` si une seule origine suffit.                |

> \* Au moins l'une des deux (`ALLOWED_ORIGINS` ou `CLIENT_URL`) doit être renseignée. Le serveur quitte immédiatement si aucune n'est définie.

Le port d'écoute est fixé à **3001** dans `api/config/env.ts`.

### Front-end

| Variable     | Obligatoire | Description                                                      |
| ------------ | ----------- | ---------------------------------------------------------------- |
| `SERVER_URL` | Oui         | URL de base de l'API utilisée par le client (ex. `http://localhost:3001`). |

`vite.config.ts` expose explicitement le préfixe `SERVER_URL` en plus du préfixe `VITE_` par défaut. Toute variable exposée de cette façon est **publique** (elle se retrouve dans le bundle client).

### Exemple `.env`

```dotenv
# Back-end
MONGO_URI=mongodb://<user>:<password>@<host>:<port>/<database>
ALLOWED_ORIGINS=http://localhost:5173

# Front-end (lu par Vite)
SERVER_URL=http://localhost:3001
```

> Ne commitez jamais votre `.env` : il est ignoré via `.gitignore`.

## Scripts npm

| Script          | Description                                                       |
| --------------- | ----------------------------------------------------------------- |
| `npm run dev`       | Lance le front-end Vite en mode développement.                |
| `npm run server`    | Lance l'API Express via `tsx` en chargeant `.env`.            |
| `npm run dev:all`   | Lance API + front en parallèle (via `concurrently`).          |
| `npm run build`     | Build TypeScript + build Vite (front-end de production).      |
| `npm run preview`   | Prévisualise le build de production du front-end.             |
| `npm run lint`      | Vérifie le code avec Biome.                                   |
| `npm run lint:fix`  | Applique les correctifs automatiques de Biome.                |

## API

Toutes les routes sont préfixées par `/api`.

### `GET /api/health`
Endpoint de santé.

**Réponse 200**
```json
{ "status": "ok" }
```

### `GET /api/astronomy`
Retourne l'ensemble des objets astronomiques stockés dans la collection MongoDB.

**Réponse 200** – tableau d'objets au format `AstronomyObject` (voir ci-dessous).

**Réponse 500** – en cas d'erreur côté base de données :
```json
{ "error": "Failed to fetch astronomy data" }
```

## Modèle de données

Interface `AstronomyObject` (stricte côté Mongoose, `strict: "throw"`).

| Champ                | Type       | Obligatoire | Notes                                      |
| -------------------- | ---------- | ----------- | ------------------------------------------ |
| `_id`                | `string`   | Oui         | Identifiant fourni (ex. `obj_001`).        |
| `type`               | `string`   | Oui         | Type d'objet (étoile, galaxie, etc.).      |
| `name`               | `string`   | Oui         | Nom courant.                               |
| `designation`        | `string`   | Non         | Désignation catalogue.                     |
| `constellation`      | `string`   | Non         |                                            |
| `distance_ly`        | `number`   | Non         | Distance en années-lumière.                |
| `apparent_magnitude` | `number`   | Non         |                                            |
| `spectral_class`     | `string`   | Non         |                                            |
| `mass_solar`         | `number`   | Non         | Masse en unités solaires (M☉).             |
| `radius_solar`       | `number`   | Non         | Rayon en unités solaires (R☉).             |
| `temperature_K`      | `number`   | Non         | Température en kelvins.                    |
| `has_known_planets`  | `boolean`  | Non         | Défaut `false`.                            |
| `tags`               | `string[]` | Non         | Défaut `[]`.                               |

Collection MongoDB utilisée : `test`.

## Déploiement

Le fichier `render.yaml` décrit un déploiement sur [Render](https://render.com/) avec deux services :

- **`galileo-api`** – service web Node (région Frankfurt). Les variables `NODE_ENV` et `MONGO_URI` doivent être configurées dans le dashboard Render (la seconde est marquée `sync: false` pour rester secrète).
- **`galileo-frontend`** – service statique. Il effectue `npm install && npm run build`, publie le dossier `dist`, et reçoit `SERVER_URL` pointant vers l'URL publique de l'API.

Une règle de rewrite `/* → /index.html` est déclarée pour le front afin de supporter les routes côté client.

## Qualité du code

- Le linting et le formatting sont gérés par **Biome** (`biome.json`).
- TypeScript est configuré en mode strict (`tsconfig.app.json`, `tsconfig.node.json`).
- La validation des variables d'environnement est effectuée au démarrage et fait échouer le processus tôt si la configuration est incomplète.

## Licence

Projet privé / pédagogique. Aucune licence publique n'est distribuée avec ce dépôt à ce jour.
