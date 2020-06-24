module.exports = (mu) => {
  mu.command({
    name: "say",
    flags: "connected",
    pattern: /(?:say\s|")(.*)/i,
    exec: async (ctx) => {
      const en = await mu.db.get(ctx._id);
      const room = await mu.db.get(en.data.location);
      const contents = room.data.contents;

      mu.send.to(
        contents.filter((item) => item !== en._id),
        `${en.data.name} says, "${ctx.args[1]}%cn"`
      );

      mu.send.to([en._id], `You say "${ctx.args[1]}%cn"`);
    },
  });
};
