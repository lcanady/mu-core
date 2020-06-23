module.exports = (mu) => {
  mu.command({
    name: "look",
    pattern: /^(?:l[ook]+|l)(?:\s+(.*))?/i,
    flags: "connected",
    exec: async (ctx) => {
      const en = await mu.db.get(ctx._id);
      let tar,
        desc = "";

      // Evaluate to figure out the value of `tar`.
      if (ctx.args[1]) {
        switch (ctx?.args[1]?.toLowerCase()) {
          case "here":
            tar = await mu.db.get(en.location);
            break;
          case "me":
            tar = en;
            break;
          default:
            const results = await mu.db.find({
              $where: function () {
                return (
                  this.data.name.toLowerCase() === ctx.args[1].toLowerCase()
                );
              },
            });
            if (results.length === 1) {
              tar = results[0];
            } else if (results.length > 1) {
              ctx.message = "I don't know which one you mean.";
              return ctx.user.write(ctx);
            } else {
              ctx.message = "I can't find that.";
              return ctx.user.write(ctx);
            }
        }
      } else {
        tar = await mu.db.get(en?.data?.location);
      }

      // If there's no target, let the user know!
      if (!tar) {
        ctx.message = "I don't see that here.";
        return ctx.user.write(ctx);
      }

      // Determine if the object Name/Moniker should be displayed
      // or nameFormat should instead.  TODO: Fill out stub for
      // nameFormat.
      desc += mu.grid.name(en, tar) + "\n";
      desc += tar.data.desc || "You see nothing sepecial.";

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

        desc += contents
          .filter((item) => mu.grid.canSee(en, item))
          .map((item) => mu.grid.name(en, item))
          .join("\n");
      }

      mu.ipc.of.ursamu.emit(
        "broadcast",
        JSON.stringify({
          ids: [en._id],
          message: desc,
        })
      );
    },
  });
};
