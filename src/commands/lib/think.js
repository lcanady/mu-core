module.exports = (mu) => {
  mu.command({
    name: "think",
    pattern: /^think\s(.*)/i,
    flags: "connected",
    exec: async (ctx) => {
      mu.send.to(ctx._id, await mu.parser.run(ctx.en, ctx.args[1], mu.scope));
    },
  });
};
