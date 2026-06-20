# Bak Bak Box News — Client

Angular 21 frontend for the Bak Bak Box News platform.

## Tech Stack

- Angular 21 (Standalone Components)
- Angular Material
- Bootstrap 5
- RxJS

## Prerequisites

- Node.js >= 20
- npm >= 10

## Local Setup

```bash
npm install
npm start
```

Open `http://localhost:4200`.

## Scripts

| Script | Description |
| ------ | ----------- |
| `npm start` | Dev server on port 4200 |
| `npm run build` | Production build |
| `npm run build:dev` | Development build |
| `npm test` | Unit tests via Karma/Jasmine |

## Environment Configuration

| File | Purpose |
| ---- | ------- |
| `src/environments/environment.ts` | Development — `apiUrl: 'http://localhost:5000/api'` |
| `src/environments/environment.production.ts` | Production — `apiUrl: '/api'` |

Production uses a relative API URL so Nginx can proxy `/api` to the backend on the same host.

## Production Build

```bash
npm run build
```

Output: `dist/bakbakbox-client/browser`

## Docker

The multi-stage Dockerfile builds the Angular app and serves it with Nginx:

```bash
docker build -t bakbakbox-client .
docker run -p 80:80 bakbakbox-client
```

For full-stack deployment with API proxy, use the root `docker-compose.yml`.

Optional build argument:

```bash
docker build --build-arg NG_APP_API_URL=/api -t bakbakbox-client .
```

## Nginx

`nginx.conf` is included for Docker and manual deployment:

- Serves the Angular SPA with fallback to `index.html`
- Proxies `/api/*` to the Express backend
- Proxies `/health` to the backend health endpoint
- Enables gzip and long-term caching for static assets
