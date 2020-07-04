module.exports = (mu) => {
  mu.command({
    name: "@shutdown",
    flags: "connected wizard+",
    category: "wizard",
    help: `
SYNTAX: @shutdown

Shut the game down safely.
    `,
    pattern: /^@shutdown/i,
    exec: async (ctx) => {
      const en = await mu.db.get(ctx._id);
      const players = await mu.db.find({
        $where: function () {
          return mu.flags.hasFlags(this, "connected");
        },
      });

      for (const player of players) {
        await mu.flags.setFlags(player, "!connected");
        mu.send.to(
          player._id,
          `%chGame:%cn Shutdown iniated by ${en.data.name}.\n Please come back again soon!`
        );
        mu.ipc.of.ursamu.emit("shutdown", en.name);
      }
    },
  });
};
