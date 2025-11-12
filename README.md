# Portfolio on Netlify

This repo hosts the static portfolio plus the Netlify Function that safely proxies Neon Postgres queries.

## Build and Test Locally

```bash
npm install
npm run build
npx netlify dev
```

### Endpoint test (separate terminal)
```bash
curl -s http://localhost:8888/.netlify/functions/db | jq .
```
Expect `{ ok: true, now: ... }`.

## Deploy Checklist
- In Netlify → Site settings → Environment variables, set `DATABASE_URL=postgresql://NEON_DATABASE_USER:NEON_DATABASE_PASSWORD@NEON_DATABASE_HOST/NEON_DATABASE_NAME?sslmode=require` (no `channel_binding=require`).
- Connect the repo to Netlify (or deploy via `netlify deploy`).
- Build command: `npm run build`
- Publish directory: `dist`
- Functions directory: `netlify/functions`
- After deploy, test:
  ```bash
  curl -s https://YOUR_NETLIFY_SITE_NAME.netlify.app/.netlify/functions/db | jq .
  ```
- Verify in the browser devtools Network tab that only `/.netlify/functions/db` is called and no secrets leak to the client.

Rotate leaked Neon credentials immediately and update the Netlify env var before shipping.
