module.exports = (mu) => {
  mu.command({
    name: "@reboot",
    flags: "connected immortal",
    pattern: /^@reboot/,
    exec: async (ctx) => {
      mu.reboot();
    },
  });
};
