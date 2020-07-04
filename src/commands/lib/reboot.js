module.exports = (mu) => {
  mu.command({
    name: "@reboot",
    flags: "connected immortal",
    category: "wizard",
    help: `
Syntax: @reboot

This command reloads the game parser. without disconnecting the sockets 
connected to the server.  Whenever a change is made to the source code, 
a @reboot will add those changes to the live game.  This is great for 
working with hardcoded commands.`,
    pattern: /^@reboot/i,
    exec: async (ctx) => {
      const en = await mu.db.get(ctx._id);
      mu.ipc.of.ursamu.emit("reboot", en.data.name);
      ctx.message = "";
      return ctx;
    },
  });
};
