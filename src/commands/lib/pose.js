module.exports = (mu) => {
  mu.command({
    name: "pose",
    flags: "connected",
    pattern: /^(pose\s|:|;)(.*)/i,
    exec: async (ctx) => {
      const en = await mu.db.get(ctx._id);
      const room = await mu.db.get(en.data.location);
      let message = "";
      // Format the message
      switch (ctx.args[1].toLowerCase()) {
        case ";":
          message = `${en.data.moniker ? en.data.moniker : en.data.name}${
            ctx.args[2]
          }`;
          break;
        default:
          message = `${en.data.moniker ? en.data.moniker : en.data.name} ${
            ctx.args[2]
          }`;
          break;
      }

      // Send it off to everyone.
      mu.ipc.of.ursamu.emit(
        "broadcast",
        JSON.stringify({
          ids: room.data.contents,
          message,
        })
      );
      ctx.message = "";
      return ctx;
    },
  });
};
