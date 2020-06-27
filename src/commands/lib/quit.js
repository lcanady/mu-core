const { IPC } = require("node-ipc");

module.exports = (mu) => {
  mu.command({
    name: "quit",
    pattern: /^quit/i,
    flags: "connected",
    exec: async (ctx) => {
      const en = await mu.db.get(ctx._id);
      if (en) await mu.flags.setFlags(en, "!connected");
      mu.ipc.of.ursamu.emit("quit", ctx.id);
    },
  });
};
