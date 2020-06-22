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
      if (char[0] && char[0].data.password === sha512(ctx.args[2])) {
        ctx._id = char[0]._id;
        await mu.flags.setFlags(char[0], "connected");
        mu.connections.set(ctx.id, char[0]._id);
        const look = await mu.force("look", ctx);
        ctx.message = "Welcome to UrsaMU!\n" + look.message;
      } else {
        ctx.message = "Authentication failed";
      }
      return ctx;
    },
  });
};
