# Agent Notes

## Project

R Computer Solutions — The IT Hub. Full-stack business website + admin CMS.

## Conventions

- TanStack Start (React 19 + Vite SSR). File routes in `src/routes/`, never edit
  `src/routeTree.gen.ts` (auto-generated).
- Styling: Tailwind v4 tokens in `src/styles.css`. Never hardcode color utilities
  in components — use semantic tokens.
- Server logic: `createServerFn` from `@tanstack/react-start` in `*.functions.ts`
  files; public webhooks/cron under `src/routes/api/public/`.
- Database: every new public table needs GRANTs + RLS policies in the same
  migration. Roles live only in `user_roles` via the `has_role` function.
- Business rules: no invented prices/stock/warranties — render
  "Contact for Price" / "Enquire for Availability". No checkout/cart.

## Ground rules

- Don't rewrite git history.
- Keep dependencies Worker-runtime compatible (see server constraints in code
  comments); no native binaries or child processes in server functions.
