module.exports = (mu) => {
  mu.command({
    name: "@shutdown",
    flags: "connected immortal",
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
        mu.ipc.of.ursamu.emit(
          "broadcast",
          JSON.stringify({
            message: `Game: Shutdown iniated by ${en.data.name}.`,
          })
        );
        mu.ipc.of.ursamu.emit("shutdown", en.name);
      }
    },
  });
};
