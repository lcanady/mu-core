module.exports = (mu) => {
  mu.command({
    name: "@flags",
    flags: "connected wizard+",
    pattern: /^@flags\s(.*)\s?=\s?(.*)/i,
    category: "admmin:flags",
    help: `
SYNTAX: @flags <target>=<[!]Flag>[ <[!]Flag> ... <[!]flag>]

Set a list of flags on an object that you have the proper permissions to edit.

ex. @flags Kumakun=amazing awesome !attention !cats`,
    exec: async (ctx) => {
      const tar = await mu.grid.target(ctx.en, ctx.args[1]);
      if (tar && mu.flags.canEdit(ctx.en, tar)) {
        // Go flag by flag to see if enactor is allowed to manipulate
        // the flag.
        const canSet = [];
        ctx.args[2].split(" ").forEach((item) => {
          if (item.startsWith("!")) item = item.slice(1);
          const flg = mu.flags.isFlag(item);
          if (flg) {
            canSet.push(mu.flags.hasFlags(ctx.en, flg.lock));
          } else {
            canSet.push(false);
          }
        });

        if (canSet.indexOf(false) < 0) {
          const res = await mu.flags.setFlags(tar, ctx.args[2]);
          res.forEach((msg) => mu.send.to(ctx._id, msg));
        } else {
          mu.send.to(ctx._id, "Permission denied.");
        }
      } else {
        mu.send.to(ctx._id, "Permission denied.");
      }
    },
  });
};
