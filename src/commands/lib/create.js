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

      // Check to see if there's already an immortal avatar made.
      const players = await mu.db.find({
        $where: function () {
          return this.flags.indexOf("immortal") !== (-1 || undefined);
        },
      });

      // Get the starting room of the game, or 'limbo' if not defined.
      const room = await mu.db.get(mu.config.game.startRoom || "#0");

      // Name not in use! Make a db record!
      if (names.length <= 0) {
        let char = await mu.grid.create(ctx.args[1], room, "user");
        char.data.password = sha512(ctx.args[2]);
        char.data.owner = char._id;
        char.data.location = mu.config.game.startRoom || "#0";

        if (players.length <= 0) {
          await mu.flags.setFlags(char, "connected immortal");
        } else {
          await mu.flags.setFlags(char, "connected");
        }

        if (char) {
          await mu.db.update(char._id, char);
          console.log("char", char);
          // Let Major know that the socket is authenticated.
          mu.ipc.of.ursamu.emit(
            "authenticated",
            JSON.stringify([char._id, ctx.id])
          );

          // Send startup commannds
          mu.send.to(ctx._id, mu.txt.get("motd"));
          mu.force(char, "look", ctx);
        } else {
          mu.ipc.of.ursamu.emit(
            "boradcast",
            JSON.stringify({
              ids: [char._id],
              message: "Error creating your character!",
            })
          );
        }
      } else {
        ctx.message = "That handle is already in use! Please choose another.";
        return ctx;
      }
    },
  });
};
