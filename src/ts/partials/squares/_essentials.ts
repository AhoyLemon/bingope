/**
 * Essential ("must") groups — the guaranteed-square mechanic from _docs/project.md.
 *
 * Each group carries its own rules (how many per card via `minimum`/`maximum`,
 * and who via `essentialFor`) plus its own squares. Unlike `centers`, essential
 * squares are ordinary dealt cells, just guaranteed to appear, so they live only
 * here and never in the main pool. Deal-time enforcement is dealer work (#4/#12).
 *
 * Crop art (`CA`), special dares (`SD`), and Blank Metal Squares (`_M`, only
 * dealt via `"one day"` when the player opted into that special group — see
 * `_specialDays.ts`) are the current groups. Any future group gets its own id
 * prefix. "Crop Art" is the
 * Minnesota State Fair's official term for the seed-portrait exhibit in the
 * Agriculture Horticulture building ("seed art" is the same thing). Every crop
 * art squares share the same short label, so the specific crop-art joke stays a
 * surprise until the player opens the square.
 */

import type { EssentialGroup } from "./_types.js";

export const essentials: EssentialGroup[] = [
  {
    groupName: "Crop Art",
    essentialFor: "everybody",
    minimum: 1,
    maximum: 1,
    squares: [
      {
        id: "CA1",
        text: "I found crop art of a movie poster and stood there a beat too long proving to myself I knew the film.",
        shortText: "Crop Art",
        difficulty: "gimme",
        type: "see",
      },
      {
        id: "CA2",
        text: "I found crop art of an album that's more than 20 years old. I may or may not have had to use Wikipedia to confirm the age.",
        shortText: "Crop Art",
        difficulty: "medium",
        type: "see",
      },
      {
        id: "CA3",
        text: "I found crop art referencing an adult cartoon. Any of them count, but come on, it was Rick and Morty.",
        shortText: "Crop Art",
        difficulty: "medium",
        type: "see",
      },
      {
        id: "CA4",
        text: "I found crop art about the Minnesota State Fair itself, made of crops, at the fair.",
        shortText: "Crop Art",
        difficulty: "gimme",
        type: "see",
      },
      {
        id: "CA5",
        text: "I found crop art that was in no way subtle about the fact the artist hates Donald Trump.",
        shortText: "Crop Art",
        difficulty: "gimme",
        type: "see",
      },
      {
        id: "CA6",
        text: "I found crop art recreating a genuinely famous painting, famous enough that I recognized it, and now I don't know which version is better.",
        shortText: "Crop Art",
        difficulty: "gimme",
        type: "see",
      },
      {
        id: "CA7",
        text: "I found crop art of a meme I had successfully forgotten until that exact moment.",
        shortText: "Crop Art",
        difficulty: "medium",
        type: "see",
      },
      {
        id: "CA8",
        text: "I found crop art that exists purely to commit to a pun about corn, beans, or seeds.",
        shortText: "Crop Art",
        difficulty: "gimme",
        type: "see",
      },
      {
        id: "CA9",
        text: "I found crop art of a person. I'm not sure if that person is famous or just some person. I genuinely have no idea who this is. And no, I promise I'm not feigning ignorance just to get this square.",
        shortText: "Crop Art",
        difficulty: "gimme",
        type: "see",
      },
      {
        id: "CA10",
        text: "I found crop art memorializing a famous person who died recently. It is, regrettably, how I found out.",
        shortText: "Crop Art",
        difficulty: "medium",
        type: "see",
      },
      {
        id: "CA11",
        text: "I found crop art of something deeply Minnesotan that is not a sports team and not the fair, a loon or the shape of the state or a stray “ope”.",
        shortText: "Crop Art",
        difficulty: "gimme",
        type: "see",
      },
      {
        id: "CA12",
        text: "I found crop art that is about crop art, a small bean-based crisis of self-awareness.",
        shortText: "Crop Art",
        difficulty: "medium",
        type: "see",
      },
      {
        id: "CA13",
        text: "I found crop art that is only words.",
        shortText: "Crop Art",
        difficulty: "medium",
        type: "see",
      },
      {
        id: "CA14",
        text: "I found a politician's name spelled out in seeds. It was Klobuchar or Flanagan.",
        shortText: "Crop Art",
        difficulty: "medium",
        type: "see",
      },
      {
        id: "CA15",
        text: "I found crop art that left no doubt the artist despises ICE. For the record, so does the guy who made this game.",
        shortText: "Crop Art",
        difficulty: "gimme",
        type: "see",
      },
    ],
  },
  {
    groupName: "Special Dares",
    essentialFor: "special",
    minimum: 1,
    maximum: 1,
    squares: [
      {
        id: "SD1",
        text: "I threw a pair of underwear onto the roof from the Skyglider. I respect the tradition. For the record, I (probably?) brought a spare pair for this event. So either I respect tradition enough to plan ahead, or enough to fully commit.",
        shortText: "Throw your underwear",
        difficulty: "gimme",
        type: "do",
      },
    ],
  },
  {
    groupName: "Blank Metal Squares",
    essentialFor: "one day",
    minimum: 1,
    maximum: 1,
    squares: [
      {
        id: "_M1",
        text: "I found one of Tasha's blue ribbons and sent her a photo in Slack. If I am Tasha, this one is free.",
        shortText: "Tasha's Blue Ribbon",
        difficulty: "gimme",
        type: "do",
      },
      {
        id: "_M2",
        text: "I saw someone wearing Zubaz who wasn't Ben.",
        shortText: "Zubaz (not Ben)",
        difficulty: "medium",
        type: "see",
      },
      {
        id: "_M3",
        text: "I wore any Blank Metal shirt, including one handed out that day, for at least an hour.",
        shortText: "Guerrilla Marketing",
        difficulty: "gimme",
        type: "do",
      },
      {
        id: "_M4",
        text: "I lined up three bald Blanksmiths' heads like a rack of bowling balls and got the photo.",
        shortText: "3 Bald Heads",
        difficulty: "rare",
        type: "do",
      },
      {
        id: "_M5",
        text: "I got a photo of EJ wearing a color that wasn't black or grey.",
        shortText: "EJ in color",
        difficulty: "medium",
        type: "do",
      },
      {
        id: "_M6",
        text: "I got Elli to give me a design opinion on something, whether I asked for one or not.",
        shortText: "Elli's opinion",
        difficulty: "gimme",
        type: "do",
      },
      {
        id: "_M7",
        text: "I overheard a total stranger going off about AI, with no idea Claude helped build this exact game.",
        shortText: "Overheard AI take",
        difficulty: "medium",
        type: "see",
      },
      {
        id: "_M8",
        text: "I watched Lemon lean over someone's shoulder to check how their bingo card was going.",
        shortText: "Lemon checks a card",
        difficulty: "rare",
        type: "see",
      },
      {
        id: "_M9",
        text: "I opened a GitHub issue on the BINGOPE repo demanding a specific new square.",
        shortText: "File GitHub issue",
        difficulty: "rare",
        type: "do",
      },
    ],
  },
];
