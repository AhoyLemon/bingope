/**
 * The shared pool of bingo squares.
 * All five cards draw from this one pool, so cards differ but overlap.
 * See WRITING_STYLE.md for the authoring rules. IDs are permanent and never reused.
 */

/** How reliably a player will get to mark this square. A dealing hint, tunable. */
export type Rarity = "gimme" | "medium" | "rare";

/** Whether the square is witnessed or performed by the player. */
export type SquareType = "see" | "do";

export interface BingoSquare {
  id: number;
  text: string;
  shortText?: string;
  rarity: Rarity;
  type: SquareType;
}

export const squares: BingoSquare[] = [
  {
    id: 1,
    text: "I just personally saw somebody get their 4th refill at the all-you-can-drink milk booth",
    shortText: "4th milk refill",
    rarity: "rare",
    type: "see",
  },
  {
    id: 2,
    text: "I saw a nearly empty bucket of Sweet Martha's in the hands of someone sick with regret",
    shortText: "A bucket of Sweet Martha's regret",
    rarity: "medium",
    type: "see",
  },
  {
    id: 3,
    text: "I found a grown adult fast asleep sitting bolt upright on a bench",
    shortText: "Asleep bolt upright on a bench",
    rarity: "medium",
    type: "see",
  },
  {
    id: 4,
    text: "I handed a cheese curd to a stranger and told them it was the sacrament of the fair",
    shortText: "Cheese curd sacrament",
    rarity: "gimme",
    type: "do",
  },
  {
    id: 5,
    text: "I overheard a stranger state their strong preference for Pronto Pups vs corn dogs (or vice versa)",
    shortText: "Pronto Pup vs corn dog opinion",
    rarity: "medium",
    type: "see",
  },
  {
    id: 6,
    text: "I spotted someone wearing two or more camo pattern clothing items (2 socks is 1 item)",
    shortText: "2+ camo items",
    rarity: "medium",
    type: "see",
  },
  {
    id: 7,
    text: "I ate a full bag of Tom Thumb mini donuts before noon",
    shortText: "A bag of mini donuts before noon",
    rarity: "gimme",
    type: "do",
  },
  {
    id: 8,
    text: "I watched an animal actually get born in the Miracle of Birth Center",
    shortText: "Saw a live birth at the barn",
    rarity: "rare",
    type: "see",
  },
  {
    id: 9,
    text: "I saw a toddler with a mullet he never agreed to",
    shortText: "A toddler with a mullet",
    rarity: "gimme",
    type: "see",
  },
  {
    id: 10,
    text: "I saw someone with obvious corn cob butter on their wrist (telling them about it was optional)",
    shortText: "There's butter on your wrist, brah!",
    rarity: "medium",
    type: "see",
  },
  {
    id: 11,
    text: "I watched someone offer to share their Big Fat Bacon and then eat the entire thing themselves",
    shortText: "The fake bacon share",
    rarity: "rare",
    type: "see",
  },
  {
    id: 12,
    text: "I stepped around a fresh pile of horse shit nobody had cleaned up yet",
    shortText: "A fresh pile of horse shit",
    rarity: "gimme",
    type: "see",
  },
  {
    id: 13,
    text: "I saw a man in overalls with no shirt underneath",
    shortText: "Overalls, no shirt",
    rarity: "medium",
    type: "see",
  },
  {
    id: 14,
    text: "I saw someone cooling off with a right-wing campaign hand fan",
    shortText: "A right-wing hand fan",
    rarity: "medium",
    type: "see",
  },
  {
    id: 15,
    text: "I saw a sunburn peeling in real time",
    shortText: "A peeling sunburn",
    rarity: "medium",
    type: "see",
  },
  {
    id: 16,
    text: "I saw two farm boys sharing a cigarette",
    shortText: "Farm boys sharing a smoke",
    rarity: "medium",
    type: "see",
  },
  {
    id: 17,
    text: "I saw a kid on a leash",
    shortText: "A kid on a leash",
    rarity: "medium",
    type: "see",
  },
  {
    id: 18,
    text: "I saw socks worn with sandals",
    shortText: "Socks with sandals",
    rarity: "gimme",
    type: "see",
  },
  {
    id: 19,
    text: "I saw someone crying while holding an ice cream cone",
    shortText: "Crying with an ice cream cone",
    rarity: "medium",
    type: "see",
  },
  {
    id: 20,
    text: "I saw a carnie wearing at least one piece of gold jewelry",
    shortText: "A carnie in gold jewelry",
    rarity: "medium",
    type: "see",
  },
  {
    id: 21,
    text: "I saw a full-size shirt that a belly had turned into an accidental crop top",
    shortText: "Belly vanquishes shirt",
    rarity: "gimme",
    type: "see",
  },
  {
    id: 22,
    text: "I ordered a 'corn dog' at a Pronto Pup stand and refused to be corrected",
    shortText: "Ordered a 'corn dog' at Pronto Pup",
    rarity: "gimme",
    type: "do",
  },
  {
    id: 23,
    text: "I yelled 'I can't believe it!' during an as-seen-on-TV gadget demo",
    shortText: "Heckled a demo",
    rarity: "medium",
    type: "do",
  },
  {
    id: 24,
    text: "I saw at least three grown men gathered around a single tractor",
    shortText: "3+ men around one tractor",
    rarity: "medium",
    type: "see",
  },
  {
    id: 25,
    text: "I saw someone hauling a Midway prize bigger than the child who won it",
    shortText: "Midway prize bigger than the kid",
    rarity: "medium",
    type: "see",
  },
  {
    id: 26,
    text: "I watched a Butter Princess getting her likeness etched into butter",
    shortText: "A live butter carving",
    rarity: "medium",
    type: "see",
  },
  {
    id: 27,
    text: "I spotted a Butter Princess outside of the Dairy Building in her sash and tiara",
    shortText: "A Butter Princess in the wild",
    rarity: "rare",
    type: "see",
  },
  {
    id: 28,
    text: "I ate a deep-fried candy bar just to learn how disappointing life can be",
    shortText: "Deep-fried candy bar",
    rarity: "gimme",
    type: "do",
  },
  {
    id: 29,
    text: "I rode the Giant Slide with my arms crossed and a serious expression",
    shortText: "Stone-faced on the Giant Slide",
    rarity: "gimme",
    type: "do",
  },
  {
    id: 30,
    text: "I pointed at a hog I was certain weighed more than 270 pounds (the Big Boar is over 1,000 pounds and does not count)",
    shortText: "A hog over 270 lbs (not the Big Boar)",
    rarity: "gimme",
    type: "do",
  },
  {
    id: 31,
    text: "I spent at least 9 Fun Card tickets on the same 'skill' game and won nothing (a consolation prize does not count)",
    shortText: "9+ tickets, no prize",
    rarity: "medium",
    type: "do",
  },
];
