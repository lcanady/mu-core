const { sha512 } = require("js-sha512");

module.exports = (mu) => {
  mu.command({
    name: "connect",
    pattern: /connect\s+?(\w+)\s+?(\w+)/i,
    flags: "!connected",
    exec: async (ctx) => {
      // Name not in use! Make a db record!
      const char = await mu.db.find({
        $where: function () {
          return this.data.name.toLowerCase() === ctx.args[1].toLowerCase();
        },
      });

      // If the character exists and the password matches ...
      if (char[0] && char[0].data.password === sha512(ctx.args[2])) {
        // Emit the IDs to Major to be added to the authenticated list.
        mu.ipc.of.ursamu.emit(
          "authenticated",
          JSON.stringify([char[0]._id, ctx.id])
        );

        // Set connection flags
        await mu.flags.setFlags(char[0], "connected");
        ctx._id = char[0]._id;

        // Run login commands.
        mu.send.to(ctx._id, mu.txt.get("motd"));
        mu.force(char[0], "look", ctx);
      } else {
        mu.send.acct(ctx.id, "Authentication failed.");
      }
    },
  });
};
