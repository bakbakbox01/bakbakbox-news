import crypto from 'crypto';

const jwtSecret = crypto.randomBytes(32).toString('hex');
const adminPassword = `BakBak@${crypto.randomBytes(4).toString('hex')}`;

console.log(`
=== Bak Bak Box — Production env (Render dashboard) ===

Copy these into Render → bakbakbox-api → Environment:

MONGODB_URI=mongodb+srv://USER:PASS@cluster.xxx.mongodb.net/bakbakbox_news
CLIENT_URL=https://YOUR-APP.vercel.app
JWT_SECRET=${jwtSecret}

ADMIN_EMAIL=bakbakbox01@gmail.com
ADMIN_PASSWORD=${adminPassword}

CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

=== Vercel env ===

API_URL=https://bakbakbox-api.onrender.com/api

Save ADMIN_PASSWORD somewhere safe — admin login ke liye use hoga.
`);
