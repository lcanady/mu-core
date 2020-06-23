module.exports = (mu) => {
  mu.command({
    name: "say",
    flags: "connected",
    pattern: /(?:say\s|")(.*)/i,
    exec: async (ctx) => {
      const en = await mu.db.get(ctx._id);
      const room = await mu.db.get(en.data.location);
      const contents = room.data.contents;

      mu.ipc.of.ursamu.emit(
        "broadcast",
        JSON.stringify({
          ids: contents.filter((item) => item !== en._id),
          message: `${en.data.name} says, "${ctx.args[1]}"`,
        })
      );

      mu.ipc.of.ursamu.emit(
        "broadcast",
        JSON.stringify({
          ids: [en._id],
          message: `You say "${ctx.args[1]}"`,
        })
      );

      ctx.message = "";
      return ctx;
    },
  });
};
