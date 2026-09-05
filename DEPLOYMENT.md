# Deploying from GitHub

This site is server-rendered (not a plain static site), so the host must run the
server output — otherwise every page shows "Page not found".

## Required environment variables (set them on the host, both build & runtime)

```
VITE_SUPABASE_URL
VITE_SUPABASE_PUBLISHABLE_KEY
VITE_SUPABASE_PROJECT_ID
SUPABASE_URL
SUPABASE_PUBLISHABLE_KEY
SUPABASE_SERVICE_ROLE_KEY
```

## Netlify

`netlify.toml` in the repo root already sets everything:
build command `npm run build`, publish directory `dist`, functions directory
`.netlify/functions-internal`, and `NITRO_PRESET=netlify`.
In the Netlify UI leave the build settings empty so the file is used.

## Vercel

`vercel.json` sets `NITRO_PRESET=vercel` and the build command. Framework preset
must stay "Other" and the Output Directory must be left empty — Nitro writes the
Vercel Build Output API folder `.vercel/output`.

## Cloudflare Workers / Pages

No env var needed; the default build target is `cloudflare-module`
(`dist/server` + `dist/client`).

## Any other host (Node server)

```
NITRO_PRESET=node-server npm run build
node dist/server/index.mjs
```
