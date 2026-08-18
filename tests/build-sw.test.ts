import { afterEach, beforeEach, expect, test } from "bun:test";
import fs from "fs";
import os from "os";
import path from "path";

import { buildPrecacheManifest } from "../scripts/build-sw";

let siteDir: string;

function write(rel: string, contents: string): void {
  const full = path.join(siteDir, rel);
  fs.mkdirSync(path.dirname(full), { recursive: true });
  fs.writeFileSync(full, contents);
}

// A miniature stand-in for the staged `_site/` artifact.
function seedSite(): void {
  write("index.html", "<!doctype html><title>home</title>");
  write("card/index.html", "<!doctype html><title>card</title>");
  write("help/index.html", "<!doctype html><title>help</title>");
  write("css/site.css", "body{}");
  write("js/min/src/ts/site.js", "console.log('app')");
  write("js/min/src/ts/site.js.map", "{}");
  write("js/min/scripts/build-sw.js", "// compiled build tooling");
  write("js/min/routes/pug.routes.js", "// compiled route map");
  write("vendor/vue.global.prod.js", "/* vue */");
  write("vendor/README.md", "# vendored assets");
  write("web-app-manifest-192x192.png", "png-bytes-192");
  write("og-wide.png", "big-social-image");
  write("BingSiteAuth.xml", "<xml/>");
  write("googledbcd44305048d5b5.html", "verification");
  write(".nojekyll", "");
  write("sw.js", "// a stale service worker from a previous run");
}

beforeEach(() => {
  siteDir = fs.mkdtempSync(path.join(os.tmpdir(), "bingope-sw-"));
  seedSite();
});

afterEach(() => {
  fs.rmSync(siteDir, { recursive: true, force: true });
});

test("precaches the app shell", () => {
  const { urls } = buildPrecacheManifest(siteDir);
  expect(urls).toContain("./index.html");
  expect(urls).toContain("./card/index.html");
  expect(urls).toContain("./help/index.html");
  expect(urls).toContain("./css/site.css");
  expect(urls).toContain("./js/min/src/ts/site.js");
  expect(urls).toContain("./vendor/vue.global.prod.js");
  expect(urls).toContain("./web-app-manifest-192x192.png");
});

test("excludes social image, source maps, build tooling, and verification files", () => {
  const { urls } = buildPrecacheManifest(siteDir);
  expect(urls).not.toContain("./og-wide.png");
  expect(urls).not.toContain("./js/min/src/ts/site.js.map");
  expect(urls).not.toContain("./js/min/scripts/build-sw.js");
  expect(urls).not.toContain("./js/min/routes/pug.routes.js");
  expect(urls).not.toContain("./vendor/README.md");
  expect(urls).not.toContain("./BingSiteAuth.xml");
  expect(urls).not.toContain("./googledbcd44305048d5b5.html");
  expect(urls).not.toContain("./.nojekyll");
  expect(urls).not.toContain("./sw.js"); // the SW must never precache itself
});

test("version changes when a precached file's content changes", () => {
  const before = buildPrecacheManifest(siteDir).version;
  write("css/site.css", "body{color:red}");
  const after = buildPrecacheManifest(siteDir).version;
  expect(after).not.toBe(before);
});

test("version is stable when only an excluded file changes", () => {
  const before = buildPrecacheManifest(siteDir).version;
  write("og-wide.png", "an entirely different social image");
  const after = buildPrecacheManifest(siteDir).version;
  expect(after).toBe(before);
});
