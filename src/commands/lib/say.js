module.exports = (mu) => {
  mu.command({
    name: "say",
    flags: "connected",
    pattern: /(?:say\s|")(.*)/i,
    exec: async (ctx) => {
      const en = await mu.db.get(ctx.user._id);
      const room = await mu.db.get(en.data.location);

      const contents = [];
      for (const item of room.data.contents) {
        contents.push(await mu.db.get(item));
      }
      // Send a special message to the enactor.
      ctx.message = `You say, "${ctx.args[1]}"`;
      ctx.user.write(ctx);

      // Send a message to all of the players in the room, except
      // the enactor.
      ctx.message = `${
        en.data.moniker ? en.data.moniker : en.data.name
      } says, ${ctx.args[1]}`;

      mu.send.to(room.data.contents, ctx, [en._id]);
    },
  });
};
