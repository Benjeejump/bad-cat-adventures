/* Seasonal content keeps the same gameplay IDs, prices and saved progress. */
"use strict";
(() => {
  const KEY = "bad-cat-christmas-v1";
  let enabled = false;
  try {
    enabled = localStorage.getItem(KEY) === "true";
  } catch {}
  const seasonal = [
    "dylan",
    "bad-cat",
    "metro",
    "captain-squirrel",
    "metro-bus",
    "bad-cat-balloon",
    "doggy-plane",
    "family-sub",
    "carwash-squid",
    "road-odyssey",
  ];
  function original(path) {
    if (!path) return path;
    for (const id of seasonal)
      if (path.endsWith(`/christmas/${id}.png`)) return `assets/${id}.png`;
    return path;
  }
  function asset(path) {
    path = original(path);
    if (enabled)
      for (const id of seasonal)
        if (path.endsWith(`/` + id + ".png"))
          return `assets/christmas/${id}.png`;
    return path;
  }
  const powers = {
    shield: ["Snow shield", "❄️"],
    laser: ["Candy zap", "🍭"],
    sonar: ["Jingle sonar", "🔔"],
    bubble: ["Snowballs", "☃️"],
    puppy: ["Reindeer pups", "🦌"],
  };
  const holidayWords = [
    ["snow", 2, "Soft snow covers the North Pole."],
    ["gift", 2, "The puppy wraps a gift."],
    ["bell", 2, "The sleigh has a shiny bell."],
    ["tree", 2, "We put lights on the Christmas tree."],
    ["star", 2, "A star shines above the tree."],
    ["card", 2, "Dylan writes a Christmas card."],
    ["coat", 2, "Put on a warm coat."],
    ["sled", 2, "The puppy rides a sled."],
    ["wish", 2, "Make a kind Christmas wish."],
    ["cold", 2, "Snow feels cold."],
    ["warm", 2, "The fire keeps us warm."],
    ["elf", 2, "An elf wraps presents."],
    ["elves", 2, "The elves help in the workshop."],
    ["light", 2, "A little light glows on the tree."],
    ["scarf", 2, "Wear a warm scarf."],
    ["ribbon", 2, "Tie a ribbon around the present."],
    ["winter", 2, "Winter is a snowy season."],
    ["cookie", 2, "The gingerbread cookie smells sweet."],
    ["candle", 2, "A candle glows in the window."],
    ["holly", 2, "Holly has green leaves."],
    ["jolly", 2, "The jolly puppy brings a gift."],
    ["candy", 2, "The candy cane has stripes."],
    ["sleigh", 3, "The sleigh carries Christmas gifts."],
    ["present", 3, "There is a present under the tree."],
    ["mitten", 3, "A mitten keeps your hand warm."],
    ["chimney", 3, "The chimney is on the gingerbread roof."],
    ["reindeer", 3, "A reindeer pulls the sleigh."],
    ["stocking", 3, "Hang a stocking by the fireplace."],
    ["gingerbread", 3, "We built a gingerbread house."],
    ["snowflake", 3, "Each snowflake looks different."],
    ["wrapping", 3, "The elves are wrapping presents."],
    ["fireplace", 3, "The fireplace makes the room cosy."],
    ["snowman", 3, "Our snowman wears a scarf."],
    ["sparkle", 3, "The tree lights sparkle."],
    ["december", 3, "Christmas comes in December."],
    ["holiday", 3, "We enjoy the winter holiday."],
    ["ornament", 3, "Hang an ornament on the tree."],
    ["icicle", 3, "An icicle hangs from the roof."],
    ["peppermint", 3, "The candy cane tastes of peppermint."],
    ["workshop", 3, "The elves are busy in the workshop."],
  ].map(([word, grade, sentence]) => ({ word, grade, sentence }));
  for (const [word, grade, sentence] of [
    ["joy", 2, "The puppies share Christmas joy."],
    ["toy", 2, "There is a toy in the stocking."],
    ["hope", 2, "We hope for a snowy day."],
    ["help", 2, "Dylan can help the elves."],
    ["kind", 2, "Give a kind Christmas gift."],
    ["share", 2, "We share our warm cocoa."],
    ["boots", 2, "Put on your snow boots."],
    ["gloves", 2, "My gloves keep my fingers warm."],
    ["flake", 2, "A tiny flake of snow lands on my paw."],
    ["frost", 2, "Frost sparkles on the window."],
    ["ice", 2, "The pond has a layer of ice."],
    ["bow", 2, "The present has a red bow."],
    ["wrap", 2, "We wrap a gift for our friend."],
    ["merry", 2, "Have a merry Christmas."],
    ["red", 2, "The stocking is red."],
    ["green", 2, "The Christmas tree is green."],
    ["white", 2, "The snow is white."],
    ["glow", 2, "The tree lights glow."],
    ["sweet", 2, "The gingerbread smells sweet."],
    ["cocoa", 2, "We drink warm cocoa."],
    ["north", 2, "The elves work at the North Pole."],
    ["pole", 2, "This sign points to the North Pole."],
    ["party", 2, "The puppies have a winter party."],
    ["robin", 2, "A robin sits on the snowy tree."],
    ["bear", 2, "A polar bear walks on the ice."],
    ["deer", 2, "A deer walks through the snow."],
    ["angel", 2, "The angel sits on top of the tree."],
    ["sing", 2, "We sing a Christmas song."],
    ["song", 2, "The puppies know a happy song."],
    ["bake", 2, "We bake Christmas cookies."],
    ["evergreen", 3, "The evergreen tree stays green in winter."],
    ["celebrate", 3, "We celebrate Christmas together."],
    ["surprise", 3, "The present is a lovely surprise."],
    ["tradition", 3, "Baking cookies is our family tradition."],
    ["decoration", 3, "Hang a decoration on the tree."],
    ["together", 3, "The puppies wrap gifts together."],
    ["kindness", 3, "Christmas is a time for kindness."],
    ["snowstorm", 3, "We stay cosy during the snowstorm."],
    ["blizzard", 3, "The blizzard brings blowing snow."],
    ["snowball", 3, "Dylan rolls a soft snowball."],
    ["snowdrift", 3, "A snowdrift is a pile of snow."],
    ["penguin", 3, "The penguin slides on the ice."],
    ["polar", 3, "The polar bear has warm fur."],
    ["forest", 3, "Snow covers the forest."],
    ["blanket", 3, "The puppy sleeps under a blanket."],
    ["sweater", 3, "My sweater keeps me warm."],
    ["sparkling", 3, "The sparkling snow shines in the sun."],
    ["village", 3, "The elves live in a snowy village."],
    ["lantern", 3, "The lantern lights our snowy path."],
    ["mistletoe", 3, "Mistletoe hangs above the door."],
    ["nutcracker", 3, "A toy nutcracker stands by the tree."],
    ["christmas", 3, "The puppies are ready for Christmas."],
    ["snowy", 3, "It is a snowy winter morning."],
    ["frozen", 3, "The frozen lake is covered in ice."],
    ["chimneys", 3, "Snow covers the little chimneys."],
    ["wreath", 3, "A wreath hangs on the door."],
    ["garland", 3, "A garland decorates the fireplace."],
    ["cinnamon", 3, "The cookies smell of cinnamon."],
    ["ribbons", 3, "The elves tie ribbons around the gifts."],
    ["glitter", 3, "The star shines with glitter."],
  ])
    if (!holidayWords.some((w) => w.word === word))
      holidayWords.push({ word, grade, sentence });
  const winterNotes = [
    "Dear Santa, I am kind. I can help the elves.",
    "We wrap a gift. It is for our puppy.",
    "The snow is soft. We can build a snowman.",
    "Max has a red box. We put a gift in it.",
    "Quick elves zip past. A jolly fox can help.",
    "Zoe has a cozy quilt. Five pups nap by it.",
    "I see a bright star. It glows in the night.",
    "We hang a stocking. It is by the warm fire.",
    "The reindeer can hop. We give it a carrot.",
    "I like your green scarf. It keeps you warm.",
    "We bake sweet cookies. I save one for you.",
    "Please bring a bell. We can ring it softly.",
    "The tree has lights. We make it sparkle.",
    "Our puppy has a hat. It is red and white.",
    "You are my best pal. Have a happy holiday.",
  ];
  const holidayFurniture = [
    ["Candy-cane puppy bed", "🛏️"],
    ["Santa snack bowl", "🥣"],
    ["Snowflake water bowl", "💧"],
    ["Holly blanket", "🧣"],
    ["Snowball toy", "☃️"],
    ["Gingerbread chew bone", "🦴"],
    ["North Pole welcome mat", "🎄"],
    ["Toy reindeer", "🦌"],
    ["Star night light", "⭐"],
    ["Present basket", "🎁"],
    ["Cosy fireplace", "🔥"],
    ["Christmas stocking", "🧦"],
    ["Holly wreath", "🌿"],
    ["Gingerbread sofa", "🛋️"],
    ["Christmas story book", "📕"],
    ["Elf rocking chair", "🪑"],
    ["Snow-globe lamp", "🔮"],
    ["Cookie jar", "🍪"],
    ["Candy-cane coat hooks", "🍭"],
    ["Reindeer rug", "🦌"],
    ["Toy sleigh", "🛷"],
    ["Christmas tree", "🎄"],
    ["Present-wrapping desk", "🎀"],
    ["Elf workshop bench", "🛠️"],
    ["Gingerbread dining table", "🍽️"],
    ["Cocoa kitchen", "☕"],
    ["Fairy-light curtains", "✨"],
    ["Santa letter box", "📮"],
    ["Winter birdhouse", "🐦"],
    ["Peppermint fountain", "⛲"],
    ["North Pole train set", "🚂"],
    ["Ornament shelf", "🔴"],
    ["Snowflake mirror", "🪞"],
    ["Holly window box", "🌺"],
    ["Gingerbread bunk bed", "🛏️"],
    ["Santa telescope", "🔭"],
    ["Reindeer stable", "🦌"],
    ["Snowy garden swing", "🛝"],
    ["Jingle-bell music box", "🔔"],
    ["Elf art desk", "🎨"],
    ["North Pole observatory", "🌌"],
    ["Christmas cinema", "🎬"],
    ["Giant gift chest", "🎁"],
    ["Candy-cane climbing frame", "🍭"],
    ["Winter reading tent", "⛺"],
    ["Snowy rooftop garden", "🌲"],
    ["Christmas party stage", "🎉"],
    ["Gingerbread baking station", "🧁"],
    ["Twinkling star projector", "🌟"],
    ["Royal stocking display", "🧦"],
  ];
  window.badCatSeason = {
    active: () => enabled,
    asset,
    original,
    holidayWords,
    winterNotes,
    holidayFurniture,
    powerName: (id, fallback) =>
      enabled ? powers[id]?.[0] || fallback : fallback,
    powerIcon: (id, fallback) =>
      enabled ? powers[id]?.[1] || fallback : fallback,
    set: (value) => {
      enabled = !!value;
      try {
        localStorage.setItem(KEY, String(enabled));
      } catch {}
      document.documentElement.classList.toggle("christmas-mode", enabled);
      window.dispatchEvent(
        new CustomEvent("bad-cat-season", { detail: { christmas: enabled } }),
      );
    },
  };
  document.documentElement.classList.toggle("christmas-mode", enabled);
})();
