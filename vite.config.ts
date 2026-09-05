// The shared TanStack/Vite config already wires up: TanStack devtools,
// tanstackStart, viteReact, tailwindcss, tsConfigPaths, nitro (build-only),
// VITE_* env injection and the @ path alias. Do NOT add those plugins manually
// or the build breaks with duplicates.
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
