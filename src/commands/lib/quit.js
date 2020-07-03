const { IPC } = require("node-ipc");

module.exports = (mu) => {
  mu.command({
    name: "quit",
    pattern: /^quit/i,
    flags: "connected",
    exec: async (ctx) => {
      mu.ipc.of.ursamu.emit("quit", ctx.id);
    },
  });
};
