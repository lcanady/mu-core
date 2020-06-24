module.exports = (mu) => {
  mu.command({
    name: "@flags",
    flags: "connected wizard+",
    pattern: /^@flags\s(.*)\s?=\s?(.*)/i,
    exec: async (ctx) => {
      const tar = await mu.grid.target(ctx.en, ctx.args[1]);
      if (tar && mu.flags.canEdit(ctx.en, tar)) {
        // Go flag by flag to see if enactor is allowed to manipulate
        // the flag.
        const canSet = [];
        ctx.args[2].split(" ").forEach((item) => {
          if (item.startsWith("!")) item = item.slice(1);
          const flg = mu.flags.isFlag(item);
          canSet.push(mu.flags.hasFlags(ctx.en, flg.lock));
        });

        if (canSet.indexOf(false) === -1) {
          const res = await mu.flags.setFlags(tar, ctx.args[2]);
          res.forEach((msg) => mu.send.to([ctx._id], msg));
        }
      } else {
        mu.send.to([ctx.en._id], "Permission denied.");
      }
    },
  });
};
