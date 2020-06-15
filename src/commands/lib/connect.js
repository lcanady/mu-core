const { sha512 } = require("js-sha512");

module.exports = (mu) => {
  mu.command({
    name: "Register",
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
        mu.connections.set(ctx.user.id, char);
        ctx.message = "Welcome to UrsaMU!";
        ctx.user.write(ctx);
      } else {
        ctx.message = "Unable to authenticate";
        ctx.user.write(ctx);
      }
    },
  });
};
