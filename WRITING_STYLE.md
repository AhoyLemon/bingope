# Writing Bingo Squares: A Style Guide

Guidance for authoring `BingoSquare` entries. Written for humans and agents. Two things matter equally. A square must be **markable at the fair**, and it must be **funny**. A square that nails only one is not done.

```ts
interface BingoSquare {
  id: number;
  text: string;
  shortText?: string;
  rarity: "gimme" | "medium" | "rare";
  type: "see" | "do";
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

Record each square's tier as its `rarity` and whether it is witnessed or performed as its `type` ('see' or 'do'). Both are hints the card deal can use to keep every card winnable. They are gut calls, not gospel, and stay tunable as the pool grows.

### 2. Specificity is the joke

'Child with a mullet' beats 'funny haircut.' The concrete detail is what makes a square both funnier and more markable. Name the food, the animal, the exact behavior. Vague squares are neither funny nor markable.

**One detail, not three.** Real specificity is a single concrete thing seen sharply, not a stack of qualifiers bolted together (a dad, in cargo shorts, with a fanny pack, asleep on a bench). Piling on traits to manufacture specificity reads as a costume, not a sighting, and it makes the square harder to mark, not easier. Find the one load-bearing detail and cut the rest.

## Writing for the grid

- **`text` is canonical and can be declarative.** Write the full, best wording in `text`. Because the player always reads full `text` before marking (the zoom view always shows it), `text` is the right place to pin down *what counts*. Writing it as a plain observation is fine, but a declarative framing ('You must hear…', 'You see someone…', 'I just personally saw…') is encouraged when a square needs its rules nailed down, and it can be longer than the grid would allow.
- **`shortText` is the card label.** The grid shows `shortText ?? text`, so `shortText` is the concise tag a player scans on the card. It is optional but strongly encouraged. When `text` is written in the declarative convention above, `shortText` is mandatory, since the full sentence will not fit the grid.
- **`shortText` stays the same joke.** Keep it recognizable as the compressed version of `text`. Never put a different or funnier joke in `shortText`, because the zoom view shows `text` and must not feel like a letdown.

## Voice

- **Observational and deadpan.** We are fairgoers noticing things. The humor is in the specificity and the recognition.
- **First person, always.** Every square is the player's own report of something they did or saw: 'I saw…', 'I spotted…', 'I overheard…', 'I handed…'. This voice is funnier to read and it is the rule, not an option. A mark records a completed thing, so even do-it squares are phrased in the first-person past ('I handed a curd to a stranger…') rather than as an instruction, because you cannot honestly mark the square until you have actually done it. Never write a square in second person ('you see…') or as a bare imperative ('Hand a curd…').
- **Describe the sighting, not a judgment.** A square is a thing you can point at. 'Deep-fried food on a stick that did not need to be on a stick' points at something. 'Questionable life choices' does not.
- **Cut modifiers that do no work, and do not make the player interpret.** If an adjective or simile is not itself the joke and is not needed to mark the square, delete it ('magnificent' mullet, a leash-puller 'like a sled dog', socks worn 'with total confidence'). Point at what is concretely there. Never require the player to read a person's inner state or motive. 'A kid on a leash' is markable. 'A kid who resents the leash' is a guess.
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
- Write `text` for clarity of what counts, not for grid width. Let `shortText` carry the compression.

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
