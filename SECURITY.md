# Security

- Rotate any leaked Neon/Netlify credentials immediately and update the corresponding environment variables.
- Never embed database URLs, API tokens, or other secrets in client-side assets; keep them in Netlify environment variables and access only via serverless functions.
