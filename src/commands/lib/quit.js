module.exports = (mu) => {
  mu.command({
    name: "quit",
    pattern: /^quit/i,
    flags: "connected",
    exec: async (ctx) => {
      const en = await mu.db.get(ctx.user._id);
      mu.connections = mu.connections.filter((user) => user.id !== ctx.user.id);

      await mu.flags.setFlags(en, "!connected");
      ctx.message = "Disconnecting...";
      ctx.user.end(ctx);
    },
  });
};
