module.exports = (mu) => {
  mu.command({
    name: "@dig",
    flags: "connected wizard+",
    pattern: /^@dig\s(.*)\s?=\s?(.*)/i,
    exec: async (ctx) => {
      const en = ctx.en;
      const [to, from] = ctx.args[2].split(",");

      // Send off the build request.
      res = mu.grid.dig(ctx.args[1], to, from);
      mu.send.to(ctx._id, res.join("\n"));
    },
  });
};
