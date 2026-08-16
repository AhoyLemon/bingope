/**
 * Essential ("must") groups — the guaranteed-square mechanic from _docs/project.md.
 *
 * Each group carries its own rules (how many per card via `minimum`/`maximum`,
 * and who via `essentialFor`) plus its own squares. Unlike `centers`, essential
 * squares are ordinary dealt cells, just guaranteed to appear, so they live only
 * here and never in the main pool. Deal-time enforcement is dealer work (#4/#12).
 *
 * Crop art (`CA`) and special dares (`SD`) are the current groups. Any future
 * group gets its own id prefix. "Crop Art" is the
 * Minnesota State Fair's official term for the seed-portrait exhibit in the
 * Agriculture Horticulture building ("seed art" is the same thing). Every crop
 * art `shortText` is prefixed "CROP ART:" so the group reads as a set on the grid.
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
        shortText: "CROP ART: movie poster",
        rarity: "gimme",
        type: "see",
      },
      {
        id: "CA2",
        text: "I found crop art of an album that's more than 20 years old. I may or may not have had to use Wikipedia to confirm the age.",
        shortText: "CROP ART: 20+ yr album",
        rarity: "medium",
        type: "see",
      },
      {
        id: "CA3",
        text: "I found crop art referencing an adult cartoon. Any of them count, but come on, it was Rick and Morty.",
        shortText: "CROP ART: adult cartoon",
        rarity: "medium",
        type: "see",
      },
      {
        id: "CA4",
        text: "I found crop art about the Minnesota State Fair itself, made of crops, at the fair.",
        shortText: "CROP ART: fair itself",
        rarity: "gimme",
        type: "see",
      },
      {
        id: "CA5",
        text: "I found crop art that was in no way subtle about the fact the artist hates Donald Trump.",
        shortText: "CROP ART: fuck Trump",
        rarity: "gimme",
        type: "see",
      },
      {
        id: "CA6",
        text: "I found crop art recreating a genuinely famous painting, famous enough that I recognized it, and now I don't know which version is better.",
        shortText: "CROP ART: famous painting",
        rarity: "gimme",
        type: "see",
      },
      {
        id: "CA7",
        text: "I found crop art of a meme I had successfully forgotten until that exact moment.",
        shortText: "CROP ART: repressed meme",
        rarity: "medium",
        type: "see",
      },
      {
        id: "CA8",
        text: "I found crop art that exists purely to commit to a pun about corn, beans, or seeds.",
        shortText: "CROP ART: bad seed pun",
        rarity: "gimme",
        type: "see",
      },
      {
        id: "CA9",
        text: "I found crop art of a person. I'm not sure if that person is famous or just some person. I genuinely have no idea who this is. And no, I promise I'm not feigning ignorance just to get this square.",
        shortText: "CROP ART: no idea who",
        rarity: "gimme",
        type: "see",
      },
      {
        id: "CA10",
        text: "I found crop art memorializing a famous person who died recently. It is, regrettably, how I found out.",
        shortText: "CROP ART: an in-memoriam",
        rarity: "medium",
        type: "see",
      },
      {
        id: "CA11",
        text: "I found crop art of something deeply Minnesotan that is not a sports team and not the fair, a loon or the shape of the state or a stray “ope”.",
        shortText: "CROP ART: peak Minnesota",
        rarity: "gimme",
        type: "see",
      },
      {
        id: "CA12",
        text: "I found crop art that is about crop art, a small bean-based crisis of self-awareness.",
        shortText: "CROP ART: about itself",
        rarity: "medium",
        type: "see",
      },
      {
        id: "CA13",
        text: "I found crop art that is only words.",
        shortText: "CROP ART: words only",
        rarity: "medium",
        type: "see",
      },
      {
        id: "CA14",
        text: "I found a politician's name spelled out in seeds. It was Klobuchar or Flanagan.",
        shortText: "CROP ART: Klobuchar or Flanagan",
        rarity: "medium",
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
        rarity: "gimme",
        type: "do",
      },
    ],
  },
];
