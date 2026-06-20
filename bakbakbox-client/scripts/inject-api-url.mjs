import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const apiUrl =
  process.env.API_URL?.trim() ||
  process.env.NG_APP_API_URL?.trim() ||
  'http://localhost:5000/api';

const target = path.join(__dirname, '..', 'src', 'environments', 'environment.production.ts');

const content = `export const environment = {
  production: true,
  apiUrl: '${apiUrl.replace(/'/g, "\\'")}',
  appName: 'Bak Bak Box News',
  recentNewsHours: 24,
  newsRefreshMs: 30000,
};
`;

fs.writeFileSync(target, content, 'utf8');
console.log('[deploy] Production API URL:', apiUrl);
