import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { resolve, dirname } from 'node:path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const htmlPath = resolve(__dirname, '../dist/index.html');

let html;
try {
  html = readFileSync(htmlPath, 'utf8');
} catch (err) {
  console.error('dist/index.html not found. Did you run npm run build?', err.message);
  process.exit(1);
}

const replacements = [
  ['script.js', 'script.min.js'],
  ['style.css', 'style.min.css']
];

let updated = html;
for (const [from, to] of replacements) {
  updated = updated.replace(new RegExp(from, 'g'), to);
}

writeFileSync(htmlPath, updated, 'utf8');
