const { sha512 } = require("js-sha512");

module.exports = (mu) => {
  mu.command({
    name: "create",
    pattern: /create\s+?(\w+)\s+?(\w+)/i,
    flags: "!connected",
    exec: async (ctx) => {
      // Make sure the name is unique.
      const names = await mu.db.find({
        $where: function () {
          return this.data.name?.toLowerCase() === ctx.args[1].toLowerCase();
        },
      });

      const players = await mu.db.find({
        $where: function () {
          return this?.data?.flags?.indexOf("immortal") !== (-1 || undefined);
        },
      });

      const room = await mu.db.get(mu.config.game.startRoom || "#0");

      // Name not in use! Make a db record!
      if (names.length <= 0) {
        let char = await mu.grid.create(ctx.args[1], room, "user");
        char.data.password = sha512(ctx.args[2]);
        char.data.owner = char._id;
        char.data.location = mu.config.game.startRoom || "#0";

        if (players.length <= 0) {
          char = await mu.flags.setFlags(char, "connected immortal");
        } else {
          char = await mu.flags.setFlags(char, "connected");
        }

        if (char) {
          ctx.user._id = char._id;
          ctx.id - char._id;

          mu.connections.push(ctx.user);
          ctx.message = "Welcome to UrsaMU!";
          ctx.user.write(ctx);
        } else {
          ctx.message = "Error creating your character.";
          ctx.user.write(ctx);
        }
      } else {
        ctx.message = "That name is already taken, or is not a good name.";
        ctx.user.write(ctx);
      }
    },
  });
};
