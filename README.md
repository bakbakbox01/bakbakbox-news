# Bak Bak Box News

Full-stack news platform with an Angular frontend, Express API, MongoDB, and Cloudinary image storage.

| Service | Stack | Default Port |
| ------- | ----- | ------------ |
| `bakbakbox-client` | Angular 21, Material, Bootstrap 5, Nginx | 80 (Docker) / 4200 (dev) |
| `bakbakbox-server` | Node.js 22, Express 5, MongoDB | 5000 |
| `mongodb` | MongoDB 7 | 27017 (internal) |

---

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Local Development](#local-development)
3. [Production Deployment with Docker](#production-deployment-with-docker)
4. [Manual Production Deployment](#manual-production-deployment)
5. [Environment Variables](#environment-variables)
6. [Production Features](#production-features)
7. [Health Checks](#health-checks)
8. [Project Structure](#project-structure)
9. [License](#license)

---

## Prerequisites

### Local development

- Node.js >= 20
- npm >= 10
- MongoDB (local or Atlas)
- Cloudinary account

### Docker deployment

- Docker Engine >= 24
- Docker Compose v2

---

## Local Development

### 1. Backend

```bash
cd bakbakbox-server
npm install
cp .env.example .env
```

Edit `bakbakbox-server/.env`:

```env
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/bakbakbox_news
JWT_SECRET=your_local_dev_secret_at_least_32_chars
CLIENT_URL=http://localhost:4200
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

Start the API:

```bash
npm run dev
```

API base URL: `http://localhost:5000/api`

### 2. Frontend

```bash
cd bakbakbox-client
npm install
npm start
```

Open `http://localhost:4200`.

Development API URL is configured in `src/environments/environment.ts`:

```typescript
apiUrl: 'http://localhost:5000/api'
```

---

## Production Deployment with Docker

Docker Compose runs three services: **MongoDB**, **Express API**, and **Angular + Nginx**.

```
Browser ──► Nginx (client:80)
                ├── /        → Angular SPA
                ├── /api/*   → Express (server:5000)
                └── /health  → Express health endpoint
                              └── MongoDB
```

### Step 1 — Configure environment

From the project root:

```bash
cp .env.example .env
```

Edit `.env` and set strong values for at least:

| Variable | Description |
| -------- | ----------- |
| `MONGO_INITDB_ROOT_PASSWORD` | MongoDB root password |
| `JWT_SECRET` | Minimum 32 characters |
| `CLOUDINARY_*` | Cloudinary credentials |
| `CLIENT_URL` | Public frontend URL (e.g. `https://yourdomain.com`) |

### Step 2 — Build and start

```bash
docker compose up -d --build
```

### Step 3 — Verify

| Check | URL |
| ----- | --- |
| Website | `http://localhost` |
| API health | `http://localhost/health` |
| API base | `http://localhost/api` |

### Step 4 — Create admin account

Register the first admin (only allowed when no admins exist):

```bash
curl -X POST http://localhost/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Admin","email":"admin@example.com","password":"YourSecurePassword123"}'
```

Then sign in at `http://localhost/admin/login`.

### Docker commands

```bash
# View logs
docker compose logs -f

# Stop services
docker compose down

# Stop and remove volumes (deletes database data)
docker compose down -v

# Rebuild after code changes
docker compose up -d --build
```

### Custom domain / HTTPS

1. Point your domain to the server running Docker.
2. Set `CLIENT_URL=https://yourdomain.com` in `.env`.
3. Place a reverse proxy (Traefik, Caddy, or Nginx) in front of port 80 with TLS certificates.
4. Rebuild the client if you change `NG_APP_API_URL` (default `/api` works with same-origin proxy).

---

## Manual Production Deployment

Use this when deploying without Docker.

### Backend

```bash
cd bakbakbox-server
npm ci --omit=dev
cp .env.example .env
# Edit .env — set NODE_ENV=production and all required variables
mkdir -p logs
npm start
```

Run behind a process manager (PM2, systemd):

```bash
pm2 start server.js --name bakbakbox-server
```

### Frontend

```bash
cd bakbakbox-client
npm ci
npm run build
```

Serve `dist/bakbakbox-client/browser` with Nginx. Use the included `nginx.conf` as a reference — it proxies `/api` to the backend.

Production API URL (`src/environments/environment.production.ts`):

```typescript
apiUrl: '/api'
```

This relative path works when Nginx serves the SPA and proxies API requests on the same host.

---

## Environment Variables

### Root `.env` (Docker Compose)

See [`.env.example`](.env.example) for the full list.

### Server `.env` (standalone)

See [`bakbakbox-server/.env.example`](bakbakbox-server/.env.example).

| Variable | Required (prod) | Default | Description |
| -------- | --------------- | ------- | ----------- |
| `NODE_ENV` | — | `development` | `production` enables strict validation |
| `PORT` | — | `5000` | HTTP port |
| `MONGODB_URI` | Yes | — | MongoDB connection string |
| `JWT_SECRET` | Yes | — | Min 32 chars in production |
| `JWT_EXPIRES_IN` | — | `7d` | Access token lifetime |
| `CLIENT_URL` | Yes | — | Allowed CORS origin(s), comma-separated |
| `CLOUDINARY_*` | Yes | — | Image upload credentials |
| `RATE_LIMIT_MAX` | — | `100` | Max API requests per window |
| `RATE_LIMIT_AUTH_MAX` | — | `20` | Max auth requests per window |
| `RATE_LIMIT_WINDOW_MS` | — | `900000` | Rate limit window (15 min) |
| `LOG_LEVEL` | — | `info` | Winston log level |
| `SHUTDOWN_TIMEOUT_MS` | — | `10000` | Graceful shutdown timeout |

### Client build

| Variable | Default | Description |
| -------- | ------- | ----------- |
| `NG_APP_API_URL` | `/api` | API base URL baked into production build |

---

## Production Features

### Backend

| Feature | Implementation |
| ------- | -------------- |
| Environment validation | `src/config/env.js` — fails fast on missing prod vars |
| Error handling | Central middleware with structured JSON responses |
| Security headers | Helmet (HSTS in production) |
| CORS | Configurable origins via `CLIENT_URL` |
| Rate limiting | Global API + stricter auth limiter |
| Compression | gzip via `compression` middleware |
| Logging | Winston (console + file logs in production) |
| HTTP logging | Morgan → Winston stream |
| Graceful shutdown | SIGTERM/SIGINT handlers close HTTP + DB |
| Trust proxy | Enabled in production for reverse proxies |

### Frontend

| Feature | Implementation |
| ------- | -------------- |
| Production build | `ng build --configuration production` |
| Environment swap | `environment.production.ts` via file replacement |
| API base URL | Relative `/api` for same-origin Nginx proxy |
| Static caching | Nginx 1-year cache for hashed assets |
| Gzip | Nginx compression for text assets |

---

## Health Checks

| Endpoint | Description |
| -------- | ----------- |
| `GET /health` | Server + database status |

Example response:

```json
{
  "status": "ok",
  "service": "bakbakbox-server",
  "environment": "production",
  "database": "connected",
  "timestamp": "2026-06-20T12:00:00.000Z"
}
```

Docker Compose uses this endpoint for service health checks before starting dependent containers.

---

## Project Structure

```
BakBakBox_News/
├── docker-compose.yml          # Full-stack orchestration
├── .env.example                # Docker Compose environment template
├── README.md                   # This file
├── bakbakbox-server/
│   ├── Dockerfile
│   ├── .dockerignore
│   ├── server.js               # Entry point
│   ├── .env.example
│   └── src/
│       ├── app.js              # Express middleware stack
│       ├── config/             # env, database, cors, helmet, logger
│       ├── controllers/
│       ├── middleware/         # auth, rate limit, errors, upload
│       ├── models/
│       ├── routes/
│       ├── services/
│       └── validators/
└── bakbakbox-client/
    ├── Dockerfile
    ├── nginx.conf              # SPA + API reverse proxy
    ├── .dockerignore
    ├── .env.example
    └── src/
        ├── environments/       # Dev + production API URLs
        └── app/                # Angular application
```

### API routes

| Prefix | Description |
| ------ | ----------- |
| `/api/auth` | Authentication |
| `/api/news` | News CRUD + public listing |
| `/api/categories` | Category management |
| `/api/upload` | Image upload (admin) |
| `/api/dashboard` | Admin dashboard stats |

---

## License

ISC
