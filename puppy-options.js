/* Two random choices per fall. Exactly one secretly succeeds and one backfires.
   The assignment is made once when the encounter opens, never rerolled by clicking. */
"use strict";
(() => {
  const options = [
    {
      id: "bubbles",
      name: "Build a huge bubble cushion",
      good: "Your bubbles catch Giant Puppy like a floating mattress. Safe landing, happy puppy!",
      bad: "POP! The bubble cushion bursts. Giant Puppy lands on the Odyssey and dents the bonnet.",
      effect: "bubbles",
    },
    {
      id: "badcat",
      name: "Let Bad Cat catch the puppy",
      good: "BOING! Giant Puppy lands on BC’s springy cat-bed. BC is squashed into a very grumpy pancake for a moment!",
      bad: "BC dodges at the last second! Giant Puppy bumps the Odyssey and BC runs off with a gadget.",
      effect: "badcat",
    },
    {
      id: "treats",
      name: "Make an enormous treat pile",
      good: "Giant Puppy sinks into a mountain of soft treats. Crunch! Best landing ever.",
      bad: "Metro steals the treat pile! The puppy skids into the Odyssey and the snacks are gone.",
      effect: "treats",
    },
    {
      id: "parachute",
      name: "Launch a puppy parachute",
      good: "The giant parachute opens. Giant Puppy floats down gently, waving all four paws.",
      bad: "It’s a kitten-sized parachute! It flutters away and the puppy lands with a dent-making bump.",
      effect: "parachute",
    },
    {
      id: "hammock",
      name: "Catch it in a waffle-wing hammock",
      good: "The waffle wings stretch into a hammock. Puppy caught! BC looks almost impressed.",
      bad: "The waffle hammock folds the wrong way! Giant Puppy tumbles into the car and jams a gadget.",
      effect: "hammock",
    },
    {
      id: "trampoline",
      name: "Deploy the super trampoline",
      good: "BOING, boing, boing… Giant Puppy lands safely after three ridiculous bounces.",
      bad: "The trampoline is too springy! It launches the puppy into the gadget deck. The cats gain an advantage.",
      effect: "trampoline",
    },
    {
      id: "vacuum",
      name: "Reverse the vacuum into a sky fan",
      good: "WHOOSH! The sky fan holds Giant Puppy in the air, then gently lowers it to the ground.",
      bad: "Metro left it on SUCK! The fan steals the snacks and Giant Puppy bumps the Odyssey.",
      effect: "vacuum",
    },
    {
      id: "blanket",
      name: "Unroll a giant picnic blanket",
      good: "The puppies hold every corner. Giant Puppy lands in a soft blanket with a very surprised woof.",
      bad: "BC pulls the wrong corner! The blanket unravels, the puppy lands on the bonnet and the forcefield jams.",
      effect: "blanket",
    },
    {
      id: "cloud",
      name: "Summon a marshmallow cloud",
      good: "A giant marshmallow cloud scoops up the puppy. A fluffy rescue with a sprinkle of puppy hair!",
      bad: "Metro sneaks in a rain cloud! It rains on the gadgets, and Giant Puppy lands with a muddy bump.",
      effect: "cloud",
    },
    {
      id: "slide",
      name: "Build a rainbow puppy slide",
      good: "Giant Puppy slides down a huge rainbow and lands right in Puppy Base’s beanbag.",
      bad: "The rainbow slide points at the Odyssey! Giant Puppy slides straight into the bumper.",
      effect: "slide",
    },
  ];
  function sample() {
    const bag = [...options];
    const a = bag.splice(Math.floor(Math.random() * bag.length), 1)[0],
      b = bag[Math.floor(Math.random() * bag.length)],
      firstGood = Math.random() < 0.5;
    return [
      { ...a, success: firstGood },
      { ...b, success: !firstGood },
    ];
  }
  window.badCatPuppyOptions = { sample, count: options.length };
})();
