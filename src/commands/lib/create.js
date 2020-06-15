const { sha512 } = require("js-sha512");

module.exports = (mu) => {
  mu.command({
    name: "Register",
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
          return this?.data?.flags.indexOf("player") !== -1;
        },
      });

      // Name not in use! Make a db record!
      if (names.length <= 0) {
        const id = `#${await mu.db.count()}`;
        const char = await mu.db.create({
          _id: id,
          data: {
            name: ctx.args[1],
            password: sha512(ctx.args[2]),
            owner: id,
            location: "#0",
            components: {},
            flags: players.length <= 0 ? ["connected, immortal"] : ["connect"],
          },
        });

        if (char) {
          mu.connections.set(ctx.user.id, char);
          ctx.user.write("Welcome to UrsaMU!");
        } else {
          ctx.user.write("Error creating your character.");
        }
      } else {
        ctx.user.write("That name is already taken, or is not a good name.");
      }
    },
  });
};
