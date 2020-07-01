const yml = require("yaml");

module.exports = (mu) => {
  mu.command({
    name: "@flags",
    flags: "connected wizard+",
    pattern: /^@flags\s(.*)\s?=\s?(.*)/i,
    category: "admin:flags",
    help: `
SYNTAX: @flags <target>=<[!]Flag>[ <[!]Flag> ... <[!]flag>]
        @flags/list
        @flag/info <flag>

The first comamnd Sets a list of flags on an object that you have the proper
permissions to edit. The second form of this command will list all available
flags and their codes/lvls.  The third form will show you detailed
information about an idividual flag.

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

  mu.command({
    name: "@flag/info",
    flags: "connected wizard+",
    pattern: /^@flag\/info\s(.*)/i,
    exec: async (ctx) => {
      const flag = mu.flags.isFlag(ctx.args[1]);
      if (flag) {
        let screen = `[padding(%ch%cb=%cn %chFLAG INFO: ${flag.name.toUpperCase()}%(${
          flag.code
        }%)%cn %ch%cb=%cn,78,%cb-%cn, center)]%r`;
        screen += `Name: %ch${flag.name}%cn%r`;
        screen += `Code: %ch${flag.code || ""}%cn%r`;
        screen += `Lvl:  %ch${flag.lvl || 0}%cn%r`;
        screen += `Lock: %ch${flag.lock || ""}%cn%r`;

        if (flag.components) {
          screen += `%r%ch%uComponents:%cn%r%r`;
          screen += yml
            .stringify(flag.components)
            .replace(/\n/g, "%r")
            .replace(/\[/g, "%[")
            .replace(/\]/g, "%]")
            .replace(/\(/g, "%(")
            .replace(/\)/g, "%)")
            .replace(/,/g, "%,")
            .replace(/([\w]+):\s([\w\d]+)/g, "$1: %ch$2%cn");
        }

        screen += `%r[repeat(%cb-%cn,78)]`;

        mu.send.to(ctx._id, await mu.parser.run(ctx.en, screen, mu.scope));
      } else {
        mu.send.to(ctx._id, "Flag not found.");
      }
    },
  });

  mu.command({
    name: "@flags/list",
    flags: "connected wizard+",
    pattern: /^@flags\/list/,
    exec: async (ctx) => {
      let screen = `[padding(%ch%cb=%cn %chFLAG LIST%cn %ch%cb=%cn,78,%cb-%cn, center)]%r`;
      let flags = mu.flags.flags.map(
        (flag) => `${flag.name.toUpperCase()}%(${flag.code}%)`
      );

      screen += `[columns(${flags.sort().join(" ")},19)]%r`;
      screen += `[repeat(%cb-%cn,78)]%rType '%ch@flag/info <flag>%cn for more info`;
      mu.send.to(ctx._id, await mu.parser.run(ctx.en, screen, mu.scope));
    },
  });
};
