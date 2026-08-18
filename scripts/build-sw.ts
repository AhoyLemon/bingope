/**
 * Service-worker generator
 * =========================
 *
 * Runs AFTER `scripts/stage-pages.ts` (see the `build:pages` script). It walks
 * the staged `_site/` artifact, builds a precache manifest of every shippable
 * asset, derives a content hash as the cache version, and writes `_site/sw.js`.
 *
 * The cache version is a hash of the precached file contents, so the generated
 * `sw.js` only changes when the shipped assets change — which is exactly what
 * lets the browser detect an update and silently swap in the new version.
 */

import fs from "fs";
import path from "path";
import crypto from "crypto";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, "..");
const artifactRoot = path.join(projectRoot, "_site");

// Files that ship in _site but the app never requests at runtime, so precaching
// them would only waste install bandwidth and cache quota.
const EXCLUDE_EXACT = new Set<string>([
  "sw.js", // the service worker never precaches itself
  ".nojekyll",
  "og-wide.png", // ~1MB social-share image, not loaded for rendering
  "BingSiteAuth.xml", // Bing site-verification file
  "vendor/vue.global.js", // Vue dev build — only referenced in `testing`, never in production
]);
const EXCLUDE_EXTENSIONS = [".map", ".d.ts", ".md"];
// Compiled build tooling — emitted into js/min but never loaded by the app.
const EXCLUDE_DIR_PREFIXES = ["js/min/scripts/", "js/min/routes/"];

function shouldExclude(relPath: string): boolean {
  const base = path.posix.basename(relPath);
  if (EXCLUDE_EXACT.has(relPath) || EXCLUDE_EXACT.has(base)) return true;
  if (EXCLUDE_EXTENSIONS.some((ext) => relPath.endsWith(ext))) return true;
  if (EXCLUDE_DIR_PREFIXES.some((prefix) => relPath.startsWith(prefix))) return true;
  // Google Search Console verification file, e.g. google<hash>.html
  if (/^google[0-9a-z]+\.html$/.test(base)) return true;
  return false;
}

function walk(dir: string, baseDir: string, out: string[]): void {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walk(full, baseDir, out);
    } else if (entry.isFile()) {
      const rel = path.relative(baseDir, full).split(path.sep).join("/");
      if (!shouldExclude(rel)) out.push(rel);
    }
  }
}

export interface PrecacheManifest {
  version: string;
  urls: string[];
}

/**
 * Build the precache manifest for a staged site directory. Pure and
 * side-effect-free so it can be unit-tested against a fixture directory.
 */
export function buildPrecacheManifest(siteDir: string): PrecacheManifest {
  const files: string[] = [];
  walk(siteDir, siteDir, files);
  files.sort();

  const hash = crypto.createHash("sha256");
  const urls: string[] = [];
  for (const rel of files) {
    hash.update(rel);
    hash.update(fs.readFileSync(path.join(siteDir, rel)));
    // Root-relative so the SW resolves it against its own location, which works
    // at both the local root (/) and the production base path (/bingope/).
    urls.push("./" + rel);
  }

  return { version: hash.digest("hex").slice(0, 12), urls };
}

// The runtime half of the service worker. Kept as a plain-JS string (it runs in
// the ServiceWorkerGlobalScope, not under the app's tsconfig). CACHE_VERSION and
// PRECACHE_URLS are injected above it by renderServiceWorker().
const SW_RUNTIME = `
const PRECACHE = "bingope-precache-" + CACHE_VERSION;
// Versioned too, so the activate sweep clears it each deploy: bounds its growth
// and lets a stale or bad (opaque) font entry self-heal instead of pinning forever.
const RUNTIME_FONTS = "bingope-fonts-" + CACHE_VERSION;
const FONT_HOSTS = ["fonts.googleapis.com", "fonts.gstatic.com"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(PRECACHE)
      .then((cache) => cache.addAll(PRECACHE_URLS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => key !== PRECACHE && key !== RUNTIME_FONTS)
            .map((key) => caches.delete(key))
        )
      )
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const request = event.request;
  if (request.method !== "GET") return;

  const url = new URL(request.url);

  // Cross-origin Google Fonts: cache-first into a separate runtime bucket,
  // populated on the first online load.
  if (FONT_HOSTS.indexOf(url.hostname) !== -1) {
    event.respondWith(cacheFirst(request, RUNTIME_FONTS));
    return;
  }

  // Same-origin app shell: cache-first. ignoreSearch lets the ?lastUpdated /
  // ?updated / ?card cache-busting query strings match their cached entries.
  if (url.origin === self.location.origin) {
    event.respondWith(sameOrigin(request));
  }
  // Anything else falls through to the network untouched.
});

function cacheFirst(request, cacheName) {
  return caches.match(request, { ignoreSearch: true }).then((cached) => {
    if (cached) return cached;
    return fetch(request).then((response) => {
      if (response && (response.ok || response.type === "opaque")) {
        const copy = response.clone();
        caches.open(cacheName).then((cache) => cache.put(request, copy));
      }
      return response;
    });
  });
}

function sameOrigin(request) {
  return caches.match(request, { ignoreSearch: true }).then((cached) => {
    if (cached) return cached;

    // Navigations to a directory (e.g. /card/?card=lemon) resolve to that
    // directory's precached index.html; ultimately fall back to the home shell.
    if (request.mode === "navigate") {
      const url = new URL(request.url);
      const indexPath = url.pathname.endsWith("/")
        ? url.pathname + "index.html"
        : url.pathname;
      return caches.match(indexPath, { ignoreSearch: true }).then((indexHit) => {
        if (indexHit) return indexHit;
        return fetch(request).catch(() =>
          caches.match("./index.html", { ignoreSearch: true })
        );
      });
    }

    return fetch(request);
  });
}
`;

export function renderServiceWorker(manifest: PrecacheManifest): string {
  return (
    "// Generated by scripts/build-sw.ts — do not edit by hand.\n" +
    `const CACHE_VERSION = ${JSON.stringify(manifest.version)};\n` +
    `const PRECACHE_URLS = ${JSON.stringify(manifest.urls, null, 2)};\n` +
    SW_RUNTIME
  );
}

function main(): void {
  if (!fs.existsSync(artifactRoot)) {
    throw new Error(
      `Staged site not found at ${artifactRoot}. ` +
        `Run "bun run build:pages" — staging must run before build:sw.`,
    );
  }

  const manifest = buildPrecacheManifest(artifactRoot);
  const swPath = path.join(artifactRoot, "sw.js");
  fs.writeFileSync(swPath, renderServiceWorker(manifest));

  console.log(
    `Service worker staged at ${swPath} ` +
      `(version ${manifest.version}, ${manifest.urls.length} precached files).`,
  );
}

// Run only when executed directly (bun scripts/build-sw.ts), not when imported
// by the unit test. Guarding on argv avoids the Bun-only import.meta.main type.
const invokedDirectly = Boolean(
  process.argv[1] && /build-sw\.(ts|js)$/.test(process.argv[1]),
);
if (invokedDirectly) {
  main();
}
