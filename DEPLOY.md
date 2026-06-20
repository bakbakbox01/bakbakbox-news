# Bak Bak Box News — Free Cloud Deploy

Deploy frontend on **Vercel** + backend on **Render** + database on **MongoDB Atlas**.

## 1. MongoDB Atlas

1. Create free M0 cluster at https://www.mongodb.com/cloud/atlas
2. Database user + password
3. Network Access → Allow `0.0.0.0/0`
4. Copy connection string:
   ```
   mongodb+srv://USER:PASS@cluster.xxx.mongodb.net/bakbakbox_news
   ```

## 2. GitHub

```bash
cd E:\BakBakBox_News
git init
git add .
git commit -m "Initial commit — Bak Bak Box News"
git branch -M main
```

Create repo on GitHub (https://github.com/new) named `bakbakbox-news`, then:

```bash
git remote add origin https://github.com/YOUR_USERNAME/bakbakbox-news.git
git push -u origin main
```

## 3. Render (API)

1. https://dashboard.render.com → **New → Blueprint**
2. Connect GitHub repo → `render.yaml` auto-detected
3. Set secret env vars in dashboard:

| Variable | Example |
|----------|---------|
| `MONGODB_URI` | Atlas connection string |
| `CLIENT_URL` | `https://your-app.vercel.app` |
| `JWT_SECRET` | random 32+ char string |
| `ADMIN_EMAIL` | `admin@yourdomain.com` |
| `ADMIN_PASSWORD` | strong password |
| `CLOUDINARY_CLOUD_NAME` | from Cloudinary |
| `CLOUDINARY_API_KEY` | from Cloudinary |
| `CLOUDINARY_API_SECRET` | from Cloudinary |

4. After deploy, note API URL: `https://bakbakbox-api.onrender.com`
5. Test: `https://bakbakbox-api.onrender.com/health`

## 4. Vercel (Frontend)

1. https://vercel.com/new → Import GitHub repo
2. **Root Directory:** `bakbakbox-client`
3. Environment variable:

| Name | Value |
|------|-------|
| `API_URL` | `https://bakbakbox-api.onrender.com/api` |

4. Deploy → note URL: `https://your-app.vercel.app`

## 5. CORS (required)

In Render dashboard, update:

```
CLIENT_URL=https://your-app.vercel.app
```

Redeploy API service.

## 6. Keep API awake (optional)

Free Render sleeps after 15 min. Use https://cron-job.org to ping every 10 minutes:

```
GET https://bakbakbox-api.onrender.com/health
```

## 7. Admin login

Open `https://your-app.vercel.app/admin/login`

Use `ADMIN_EMAIL` + `ADMIN_PASSWORD` from Render env (auto-created on first boot).

## Local production build test

```bash
cd bakbakbox-client
set API_URL=https://bakbakbox-api.onrender.com/api
npm run build:deploy
```
