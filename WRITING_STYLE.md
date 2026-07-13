# Writing Bingo Squares: A Style Guide

Guidance for authoring `BingoSquare` entries. Written for humans and agents. Two things matter equally. A square must be **markable at the fair**, and it must be **funny**. A square that nails only one is not done.

```ts
interface BingoSquare {
  id: number;
  text: string;
  shortText?: string;
}
```

## The two bars

### 1. Markability is gameplay

Every square must be plausibly markable at the Minnesota State Fair in a single day, by one person on foot. There are two honest ways to mark a square.

- **Witness it.** You see it happen (someone eating Sweet Martha's Cookies out of the bucket). Most squares are this.
- **Do it.** The square is something the player can go make happen (eat a corn dog, ride the Giant Slide). These are welcome. A "do it" square is a gimme the player controls, which helps keep a card winnable.

Either way, a square must be unambiguous enough to argue about pleasantly. 'Does a corn dog count as a Pronto Pup?' is a good fight. 'Is that person having a bad day?' is an unwinnable one. If nobody can honestly mark it, witnessed or done, it is dead weight.

Mix the frequencies deliberately.

- **Gimmes.** You will see it within the first hour, or you can just go do it. They keep a card from feeling hopeless.
- **Mediums.** You will probably see it if you are paying attention. This is the backbone of the card.
- **Rare gems.** You might witness it, and marking it feels like winning a small lottery. A few per pool, never many.

### 2. Specificity is the joke

'Child with a mullet' beats 'funny haircut.' The concrete detail is what makes a square both funnier and more markable. Name the food, the animal, the exact behavior. Vague squares are neither funny nor markable.

## Writing for the grid

- **`text` is canonical.** Write the full, best wording in `text`. The grid shows `shortText ?? text` and the zoom view always shows `text`, so `text` carries the joke.
- **Write it to fit the grid first.** Aim short enough to read cleanly in a small square. A tight `text` needs no `shortText` at all, and that is the preferred outcome.
- **`shortText` is an escape hatch, not a default.** Add it only when `text` is genuinely too long to fit the grid without looking bad. Keep `shortText` recognizable as the same joke, just compressed. Never put a different or funnier joke in `shortText`, because the zoom view shows `text` and must not feel like a letdown.

## Voice

- **Observational and deadpan.** We are fairgoers noticing things. The humor is in the specificity and the recognition.
- **Describe the sighting, not a judgment.** A square is a thing you can point at. 'Deep-fried food on a stick that did not need to be on a stick' points at something. 'Questionable life choices' does not.
- **One joke, one best phrasing.** Do not ship alternate wordings of the same square. Find the funniest version and commit to it.
- **Edge is a knob, and it runs hot.** This game is allowed to be crude, mean, and pointed. Fair people-watching is a target-rich environment and we are not being precious about it. Turn crassness up or down square by square to taste, but the default leans sharp, not safe. Pitch bold and let Lemon dial back. Do not self-censor the suggestion. The one floor: markability and pleasant-arguability still hold, and we notice behavior and things, not private tragedy.

## Center squares

Each of the five cards has a center square, and the center is special. It anchors both diagonals plus a row and a column, so it should be a near-lock. We need several center-square candidates, not one, so the five cards can differ.

A center square is one of two things.

- **An auto-mark** the game treats as already seen, a joke that is true the moment you walk in.
- **A do-it or gimme so reliable** it is effectively free (you will eat something fried today).

Because the center is basically free, it is the safest place to spend the boldest joke, the one that does not depend on catching a rare sighting. Write center candidates to be funny on their own, since every player stares at their center all day. Whether the center auto-marks or the player marks it is decided later, so write candidates that work either way.

## Writing mechanics

- Follow Lemon's global writing rules. The two that bite here: no em-dashes and no semicolons. Use periods or commas instead. Also avoid the usual AI tells.
- Use single quotes for any quotation inside a square, since the field itself is a double-quoted string.
- **Sentence case.** Capitalize the first word only, then lowercase the rest, except for proper nouns that demand a capital (Sweet Martha's, Pronto Pup, Machinery Hill). Squares read as observations, not headlines.
- Keep `text` tight. If you are reaching for `shortText`, first try to cut `text` down instead.

## Examples

Approved squares that show the bar in practice.

| `text` | `shortText` | Notes |
|--------|-------------|-------|
| Two farm boys sharing a cigarette | (none) | Short and specific. Fits the grid raw, so no `shortText`. |
| A nearly empty bucket of Sweet Martha's, held by someone who regrets emptying it | A bucket of Sweet Martha's regret | Same joke, compressed. `shortText` earns its place because `text` is long. |
| A toddler asleep in a wagon with a corn dog still gripped in one fist | (none) | One concrete image doing all the work. Specificity, no stacked references. |

## Workflow

1. Draft toward the frequency mix. Check what the pool is short on (gimmes versus mediums versus rares) before adding more of what it already has.
2. **Pitch bold, Lemon dials back.** When drafting for review, pitch the sharper version. Lemon reads every square and softens anything himself, so 'too far' is his call, not yours to pre-empt. Timid drafts waste the review.
3. **Explicit yes before it ships.** Never commit or push a square Lemon has not approved. Treat drafts as proposals.
4. Append approved squares with the next sequential `id`. IDs are permanent. An id stays with an idea through wording changes, and retired ids are never reused for different content.
