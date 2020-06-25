module.exports = (mu) => {
  mu.command({
    name: "think",
    pattern: /^think\s(.*)/i,
    flags: "connected",
    exec: async (ctx) => {
      mu.send.to(
        ctx._id,
        await mu.parser.evaluate(ctx.en, mu.parser.parse(ctx.args[1]), {
          "%#": ctx._id,
        })
      );
    },
  });
};
