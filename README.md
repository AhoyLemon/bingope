# BINGOPE

#### (Minnesota State Fair bingo for five specific people)

## What is this?

BINGOPE is a bingo game to play at the 2026 Minnesota State Fair.

Everyone gets a different card full of things they might see at the fair. Mark enough squares to complete a row, column, or diagonal and the site celebrates. Then keep playing. We'll figure out how to score the whole day when we get home.

The finished site will live at [ahoylemon.github.io/bingope](https://ahoylemon.github.io/bingope/).

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

- [`pug/`](pug/) contains the homepage, five player pages, and shared page partials.
- [`routes/pug.routes.ts`](routes/pug.routes.ts) maps those templates to clean URLs.
- [`scss/`](scss/) contains the styles.
- [`ts/`](ts/) contains the Vue application code.
- [`scripts/`](scripts/) contains the build and development tools.
- [`PROJECT.md`](PROJECT.md) explains the decisions and constraints that are easy to forget.
- [Milestone 1](https://github.com/AhoyLemon/bingope/milestone/1) and its issues are the actual project plan.

## What's this written in?

[![Pug](https://img.shields.io/badge/Pug-000?style=flat-square&labelColor=212121&logo=pug&logoColor=A86454&color=fff)](https://pugjs.org/)
[![Sass](https://img.shields.io/badge/Sass-000?style=flat-square&labelColor=212121&logo=sass&logoColor=CC6699&color=fff)](https://sass-lang.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-000?style=flat-square&labelColor=212121&logo=typescript&logoColor=3178C6&color=fff)](https://www.typescriptlang.org/)
[![Vue.js](https://img.shields.io/badge/Vue.js-000?style=flat-square&labelColor=212121&logo=vue.js&logoColor=42B883&color=fff)](https://vuejs.org/)
[![Bun](https://img.shields.io/badge/Bun-000?style=flat-square&labelColor=212121&logo=bun&logoColor=FBF0DF&color=fff)](https://bun.sh/)
[![GitHub Pages](https://img.shields.io/badge/GitHub%20Pages-000?style=flat-square&labelColor=212121&logo=github&logoColor=fff&color=fff)](https://pages.github.com/)

Pug, Sass, TypeScript, and Vue 3. It builds into a small static site and deploys to GitHub Pages. There is no backend, no Vite, and no Nuxt.

## What else should I know?

This is a personal project, not a general-purpose bingo platform. Build the version we need for September 3, 2026 first. Anything reusable or public can be somebody's problem later.

The code and cards freeze on September 1. Every push to `main` builds and republishes the site.
