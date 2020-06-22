module.exports = (mu) => {
  mu.command({
    name: "@reboot",
    flags: "connected immortal",
    pattern: /^@reboot/i,
    exec: async (ctx) => {
      const connections = Array.from(mu.connections.keys()).join(",");
      mu.ipc.of.ursamu.emit("reboot", connections);
      ctx.message = "";
      return ctx;
    },
  });
};
