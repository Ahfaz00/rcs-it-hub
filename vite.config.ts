// @lovable.dev/vite-tanstack-config already includes the following — do NOT add them manually
// or the app will break with duplicate plugins:
//   - TanStack devtools (dev-only, first), tanstackStart, viteReact, tailwindcss, tsConfigPaths,
//     nitro (build-only using cloudflare as a default target), VITE_* env injection, @ path alias,
//     React/TanStack dedupe, error logger plugins, and sandbox detection (port/host/strictPort).
// You can pass additional config via defineConfig({ vite: { ... }, etc... }) if needed.
import { defineConfig } from "@lovable.dev/vite-tanstack-config";

// This app is server-rendered, so the build output must match the host it is
// deployed to. Netlify and Vercel set their own env vars during CI, so we map
// them to the matching Nitro preset. Anything else keeps the default target.
function resolvePreset(): string | undefined {
  const explicit = process.env["NITRO_PRESET"] || process.env["SERVER_PRESET"];
  if (explicit) return explicit;
  if (process.env["NETLIFY"]) return "netlify";
  if (process.env["VERCEL"]) return "vercel";
  return undefined;
}

const preset = resolvePreset();

export default defineConfig({
  tanstackStart: {
    // Redirect TanStack Start's bundled server entry to src/server.ts (our SSR error wrapper).
    // nitro/vite builds from this
    server: { entry: "server" },
  },
  nitro: preset ? { preset } : true,
});
