# Bak Bak Box News — Server

Express.js REST API for the Bak Bak Box News platform.

## Tech Stack

- Node.js 22 + Express 5
- MongoDB + Mongoose
- JWT + bcryptjs
- Multer + Cloudinary
- Winston, Helmet, Compression, express-rate-limit

## Prerequisites

- Node.js >= 20
- MongoDB instance (local, Atlas, or Docker)

## Local Setup

```bash
npm install
cp .env.example .env
# Edit .env with your credentials
npm run dev
```

## Scripts

| Script | Description |
| ------ | ----------- |
| `npm start` | Start production server |
| `npm run dev` | Start with file watch |

## API Base URL

```
http://localhost:5000/api
```

## Health Check

```
GET http://localhost:5000/health
```

## Production Features

- **Environment validation** — required variables checked when `NODE_ENV=production`
- **Helmet** — security headers with HSTS in production
- **CORS** — configurable via `CLIENT_URL` (comma-separated origins)
- **Rate limiting** — 100 req/window (API), 20 req/window (auth)
- **Compression** — gzip response compression
- **Logging** — Winston console + `logs/error.log` and `logs/combined.log`
- **Graceful shutdown** — closes HTTP server and MongoDB on SIGTERM/SIGINT

## Docker

Build and run standalone (requires external MongoDB):

```bash
docker build -t bakbakbox-server .
docker run -p 5000:5000 --env-file .env bakbakbox-server
```

For full-stack deployment, use the root `docker-compose.yml`.

## Environment Variables

See `.env.example` for the complete list. Required in production:

- `MONGODB_URI`
- `JWT_SECRET` (minimum 32 characters)
- `CLIENT_URL`
- `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`
