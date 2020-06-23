const { IPC } = require("node-ipc");

module.exports = (mu) => {
  mu.command({
    name: "quit",
    pattern: /^quit/i,
    flags: "connected",
    exec: async (ctx) => {
      const en = await mu.db.get(ctx._id);

      await mu.flags.setFlags(en, "!connected");
      mu.ipc.of.ursamu.emit("quit", ctx._id);

      ctx.message = "";
      return ctx;
    },
  });
};
