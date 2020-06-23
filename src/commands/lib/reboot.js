module.exports = (mu) => {
  mu.command({
    name: "@reboot",
    flags: "connected immortal",
    pattern: /^@reboot/i,
    exec: async (ctx) => {
      const en = await mu.db.get(ctx._id);
      mu.ipc.of.ursamu.emit("reboot", en.data.name);
      ctx.message = "";
      return ctx;
    },
  });
};
