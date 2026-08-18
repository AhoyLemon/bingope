# Vendored third-party runtime assets

These files are served verbatim from the site root (`/vendor/…`) via
`scripts/stage-pages.ts`, which copies everything under `src/static/`.

## Vue

- `vue.global.prod.js` / `vue.global.js` — **Vue 3.5.41**, pinned.

Vue is vendored (rather than loaded from a CDN) so the app has no third-party
runtime dependency: it works fully offline via the service worker, and it can't
break during a CDN outage. `vue@3` on unpkg is a floating range; vendoring pins
the exact version so what ships is always what was tested.

To update: download the two builds from
`https://unpkg.com/vue@<version>/dist/` and bump the version here.
