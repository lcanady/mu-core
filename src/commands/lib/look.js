module.exports = (mu) => {
  mu.command({
    name: "look",
    pattern: /^(?:l[ook]+|l)(?:\s+(.*))?/i,
    flags: "connected",
    category: "general:basics",
    help: `
SYNTAX: l[ook] [<target>]

Look is used to see the descriptions and other notable clues by taking a
quick look at a target.  The target must be in the same room as you, and
you must have the proper permissions to view the intended target.`,
    exec: async (ctx) => {
      const en = await mu.db.get(ctx._id);
      let desc = "";

      const tar = await mu.grid
        .target(ctx.en, ctx.args[1] || "")
        .catch((err) => mu.send.to([ctx._id], err.message));

      // If there's no target, let the user know!
      if (!tar) {
        mu.send.to([ctx._id], "I don't see that here.");
      }

      // Determine if the object Name/Moniker should be displayed
      // or nameFormat should instead.  TODO: Fill out stub for
      // nameFormat.
      desc += mu.grid.name(en, tar) + "\n";
      desc += tar.data.desc || "You see nothing special.";

      // Check to see if the target has anything in it's inventory.
      if (tar.data.contents.length > 0) {
        desc += `${
          mu.flags.hasFlags(tar, "user") ? "\nCarrying:\n" : "\nContents:\n"
        }`;

        // Get the contents of the target
        let contents = [];
        for (let item of tar.data.contents) {
          contents.push(await mu.db.get(item));
        }

        // And add them to the desc!
        desc += contents
          .filter((item) => mu.grid.canSee(en, item))
          .map((item) => mu.grid.name(en, item))
          .join("\n");
      }
      mu.send.to(ctx._id, desc);
    },
  });
};
