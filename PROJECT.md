# BINGOPE Project Notes

This file records the project decisions that are not obvious from the code. Current work, sequencing, and acceptance criteria live in [Milestone 1](https://github.com/AhoyLemon/bingope/milestone/1) and its issues.

## The goal

BINGOPE is a personal, one-day observation bingo game for Lemon, Simone, Angie, Mike, and Victor at the 2026 Minnesota State Fair.

Each person gets a distinct, pre-dealt card. The cards pull from one shared pool of funny, specific things someone might plausibly see at the fair. The five cards should differ but can overlap.

The site is publicly accessible because it is hosted on GitHub Pages. The audience is still those five people. It does not need accounts, privacy controls, a backend, shared state, or a way to support other groups.

## How the game works

Each player opens their own URL and marks sightings on their own phone. Marks stay in that browser.

Completing a row, column, or diagonal makes a bingo. A card can have more than one bingo at a time. A bingo gets highlighted and celebrated, but it does not end the game. Everyone keeps playing, and the group decides how to score the day afterward.

The site does not announce a winner or synchronize anything between phones.

## Square data

```ts
interface BingoSquare {
  id: number;
  text: string;
  shortText?: string;
  rarity: "gimme" | "medium" | "rare";
  type: "see" | "do";
}
```

`text` is the canonical wording and defines what counts. The grid displays `shortText ?? text`, and the larger zoomed view always displays `text`. Since the player always reads full `text` before marking, `text` can be declarative and longer than the grid allows. `shortText` is the concise card label: optional but strongly encouraged, and required whenever `text` is too long to fit the grid.

Square IDs are sequential integers. An ID stays with the same idea through wording changes. Retired IDs are never reused for different content. IDs do not describe order, rarity, or card position.

`rarity` and `type` are authoring-time judgments recorded for the eventual card deal. `rarity` ('gimme', 'medium', 'rare') lets the deal weight cards so every card stays winnable. `type` ('see', 'do') marks whether the square is witnessed or performed. Both are hints, not gospel, and stay tunable.

[`WRITING_STYLE.md`](WRITING_STYLE.md) is the source of truth for square writing. No square copy ships without Lemon's approval.

The center square is still an open question. It may be an easy sighting the player marks, or a joke the game treats as already seen. Make that decision after reviewing the writing.

### Guaranteed and special squares (idea, not built)

Some squares sit between the free center and the ordinary pool: not free, because you do not get them on walk-in, but things we want every one of our five players to do or catch. The first example is "Throw a pair of underwear from the Skyglider." A candidate deal rule is a small subroutine that guarantees each dealt card includes at least one such special square and at least one crop art square. This is a maybe, and implementation is paused. It probably wants its own issue once the square pool is settled.

## Saved state

Saved state represents what is true now, not a permanent event log.

- Marking a square saves an ISO `markedAt` timestamp.
- Unmarking it removes the mark and timestamp.
- Each active bingo stores its own completion timestamp.
- One mark may complete more than one bingo.
- Unmarking a square invalidates only the bingo lines that depend on it.
- Re-completing an invalidated line creates a new completion timestamp.

The initial version does not show timestamps. Keeping them makes a later scoring screen possible.

## Technical boundaries

- The site is static and multipage.
- Pug builds the homepage and five player routes.
- Sass handles styling.
- TypeScript and Vue 3 handle interactive card behavior.
- Vue loads from a CDN. Do not add Vite, Nuxt, a router, or a state library without a real need.
- Bun is Lemon's preferred package manager and is used in GitHub Actions. Harmless npm compatibility can stay.
- Marks and bingo state live in `localStorage`, namespaced by player and stable square ID.
- Recent iPhones and Pixels are the only meaningful browser targets.
- The personal version does not need PWA or guaranteed offline support. Once loaded, gameplay itself requires no network traffic.
- Asset URLs must work from the GitHub Pages `/bingope/` project path and from one-folder-deep player routes.

Automated testing stays extremely small. If the pages build, Sass compiles, and TypeScript type-checks, that is enough. The final experience gets checked manually on the five real phones.

## Commits and attribution

Do not add AI-tool attribution to commits or pull requests in this repo. No `Co-Authored-By` trailer for an assistant, no "generated with" footer. Contributors appear as themselves. Agents working here must strip those lines before committing.

## Deal and freeze

Cards are dealt on Lemon's machine and committed as plain data. The deployed site never shuffles them. The commit is the lock.

The personal version must be finished by September 1, 2026. Both code and content freeze that day. Everyone arrives September 2, and the group goes to the fair September 3.

The freeze covers the approved writing, center-square treatment, five dealt cards, application code, styling, and deployed build. Lemon owns the project and can override his own deadline if reality requires it.

## Maybe later

None of these are current requirements:

- Use the saved timestamps in a scoring screen.
- Randomize celebrations or make later bingos more elaborate.
- Document what a reusable public version would require, then refactor if anyone actually wants it.
- Add offline or installable-PWA support to that public version.

If a public 2026 version becomes real, it needs to ship by August 26. Otherwise, do not spend time designing it.
