# BINGOPE

#### (Minnesota State Fair bingo)

## What is this?

BINGOPE is a bingo game to play at the 2026 Minnesota State Fair.

Everyone gets a different card full of things they might see at the fair. Mark enough squares to complete a row, column, or diagonal and the site celebrates. Then keep playing. As for scoring and prizes, that's up to you.

It's running at [bingope.ahoylemon.xyz](https://bingope.ahoylemon.xyz).

## Can I run this locally?

Yeah. You'll need [Bun](https://bun.sh/).

```bash
bun install
bun run dev
```

Other useful commands:

```bash
bun run test         # compile Sass and type-check TypeScript
bun run build        # build the site
bun run build:pages  # build the deployable site in _site/
```

## Where is everything?

- [`src/pug/`](src/pug/) contains the homepage, the single card page (shared by every player), and shared page partials.
- [`routes/pug.routes.ts`](routes/pug.routes.ts) maps those templates to clean URLs.
- [`src/scss/`](src/scss/) contains the styles.
- [`src/ts/`](src/ts/) contains the Vue application code.
- [`src/svg/`](src/svg/) and [`src/img/`](src/img/) contain static assets.
- [`scripts/`](scripts/) contains the build and development tools.
- [`_docs/`](_docs/) has project notes, writing guidelines, and tooling references — see [`_docs/project.md`](_docs/project.md) for the decisions and constraints that are easy to forget.

## What's this written in?

[![Pug](https://img.shields.io/badge/Pug-000?style=flat-square&labelColor=212121&logo=pug&logoColor=A86454&color=fff)](https://pugjs.org/)
[![Sass](https://img.shields.io/badge/Sass-000?style=flat-square&labelColor=212121&logo=sass&logoColor=CC6699&color=fff)](https://sass-lang.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-000?style=flat-square&labelColor=212121&logo=typescript&logoColor=3178C6&color=fff)](https://www.typescriptlang.org/)
[![Vue.js](https://img.shields.io/badge/Vue.js-000?style=flat-square&labelColor=212121&logo=vue.js&logoColor=42B883&color=fff)](https://vuejs.org/)
[![Bun](https://img.shields.io/badge/Bun-000?style=flat-square&labelColor=212121&logo=bun&logoColor=FBF0DF&color=fff)](https://bun.sh/)
[![GitHub Pages](https://img.shields.io/badge/GitHub%20Pages-000?style=flat-square&labelColor=212121&logo=github&logoColor=fff&color=fff)](https://pages.github.com/)

Pug, Sass, TypeScript, and Vue 3. It builds into a small static site and deploys to GitHub Pages. There is no backend, everything is saved in `localStorage`.

## What else should I know?

Anyone can play, just type a name. Five names get bespoke, hand-tuned cards because that's who this was originally built for; every other name gets a card seeded deterministically from what you type. Special games (an extra themed square set, a one-day dare) can be layered on for specific groups at Lemon's discretion, but that's a feature on top of the game, not the whole point of it.

On a special day, the homepage asks an extra opt-in question before the name form ("Are you here with Lemon?", "Do you work for Blank Metal?"). Say yes and you either land on one of the five bespoke cards or get a seeded card guaranteed to include that day's themed square. See [`_docs/project.md`](_docs/project.md#special-days) for how that actually works.

Every push to `main` builds and republishes the site.
