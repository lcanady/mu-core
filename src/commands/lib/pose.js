module.exports = (mu) => {
  mu.command({
    name: "pose",
    flags: "connected",
    pattern: /^(pose\s|:|;)(.*)/i,
    exec: async (ctx) => {
      const en = await mu.db.get(ctx.user._id);
      const room = await mu.db.get(en.data.location);

      // Format the message
      switch (ctx.args[1].toLowerCase()) {
        case ";":
          ctx.message = `${en.data.moniker ? en.data.moniker : en.data.name}${
            ctx.args[2]
          }`;
          break;
        default:
          ctx.message = `${en.data.moniker ? en.data.moniker : en.data.name} ${
            ctx.args[2]
          }`;
          break;
      }

      // Send it off to everyone.
      mu.send.to(room.data.contents, ctx);
    },
  });
};
