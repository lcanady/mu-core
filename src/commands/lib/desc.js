module.exports = (mu) => {
  mu.command({
    name: "@desc",
    pattern: /^@desc\s(.*)\s?=\s?(.*)/i,
    flags: "connected",
    exec: async (ctx) => {
      const tar = await mu.grid.target(ctx.en, ctx.args[1]);
      if (mu.flags.canEdit(tar)) {
        if (mu.flags.hasFlags(tar, "object")) {
          tar.data.desc = ctx.args[2];
          await mu.db.update(tar._id, tar);
          mu.send.to(
            [ctx.en._id],
            `Done. Description for %ch${mu.grid.name(ctx.en, tar)}%cn set.`
          );
        } else {
          mu.send.to([ctx.en._id], "That's not an editable entity.");
        }
      } else {
        mu.send.to([ctx.en._id], "Permission denied.");
      }
    },
  });
};
