# Bak Bak Box News — Free Cloud Deploy

Deploy frontend on **Vercel** + backend on **Render** + database on **MongoDB Atlas**.

**GitHub repo (ready):** https://github.com/bakbakbox01/bakbakbox-news

**Helper commands (local):**

```powershell
cd E:\BakBakBox_News
node scripts/generate-deploy-env.mjs   # random JWT + admin password
powershell -File scripts/open-deploy-links.ps1   # open signup pages
```

---

## पूरा Deploy Process (Hindi)

### Architecture

```
User Browser
    ↓
Vercel (Angular frontend)  →  API calls  →  Render (Express API)  →  MongoDB Atlas
                                                    ↓
                                              RSS sync (BBC, etc.)
```

| Service | Kaam | Free? |
|---------|------|-------|
| **Vercel** | Website (Angular) | ✅ |
| **Render** | Backend API | ✅ |
| **MongoDB Atlas** | Database | ✅ M0 |
| **Cloudinary** | Admin image upload | ✅ |

### Step 1 — MongoDB Atlas (Database)

1. https://www.mongodb.com/cloud/atlas/register → account banao
2. **Build a Database** → **M0 FREE** → region India ya closest
3. **Database Access** → Add user (username + password note karo)
4. **Network Access** → **Add IP** → **Allow Access from Anywhere** (`0.0.0.0/0`)
5. **Connect** → Drivers → connection string copy karo:
   ```
   mongodb+srv://USER:PASS@cluster0.xxxxx.mongodb.net/bakbakbox_news
   ```
   `USER`, `PASS` replace karo. Database name `bakbakbox_news` rakho.

### Step 2 — Cloudinary (Admin uploads)

1. https://cloudinary.com/users/register/free
2. Dashboard se copy karo: **Cloud Name**, **API Key**, **API Secret**

### Step 3 — Render (Backend API)

1. https://dashboard.render.com/register → GitHub se sign up
2. **New → Blueprint**
3. Repo select karo: `bakbakbox01/bakbakbox-news`
4. `render.yaml` auto detect hoga → **Apply**
5. Secret env vars set karo (pehle `node scripts/generate-deploy-env.mjs` chalao):

| Variable | Value |
|----------|-------|
| `MONGODB_URI` | Atlas connection string |
| `CLIENT_URL` | Pehle `*` rakho, baad mein Vercel URL |
| `JWT_SECRET` | script se generate |
| `ADMIN_EMAIL` | `bakbakbox01@gmail.com` |
| `ADMIN_PASSWORD` | strong password |
| `CLOUDINARY_*` | Cloudinary dashboard se |

6. Deploy complete hone ke baad test: `https://bakbakbox-api.onrender.com/health` → `{"status":"ok"}`

### Step 4 — Vercel (Frontend)

1. https://vercel.com/new → GitHub connect
2. Repo: `bakbakbox-news`
3. **Root Directory:** `bakbakbox-client` (important!)
4. Environment Variable:

| Name | Value |
|------|-------|
| `API_URL` | `https://bakbakbox-api.onrender.com/api` |

5. **Deploy** → URL milega jaise `https://bakbakbox-news.vercel.app`

### Step 5 — CORS fix

Render dashboard → `bakbakbox-api` → Environment:

```
CLIENT_URL=https://bakbakbox-news.vercel.app
```

Save → Manual redeploy.

### Step 6 — Test

- Home: `https://YOUR-VERCEL-URL/`
- Admin: `https://YOUR-VERCEL-URL/admin/login`
- Login: `ADMIN_EMAIL` + `ADMIN_PASSWORD`

### Step 7 — API awake (optional)

Render free tier 15 min baad sleep. https://cron-job.org se har 10 min ping:

```
GET https://bakbakbox-api.onrender.com/health
```

---

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
