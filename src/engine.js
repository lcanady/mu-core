const ipc = require("node-ipc");
const MU = require("./api/mu");

// IPC Configuration
ipc.config.id = "parser";
ipc.config.retry = 1500;

// Connect to the pubsub server.
ipc.connectTo("ursamu", () => {
  mu = new MU(ipc);
  mu.start();

  // Handle a message when it comes down the wire and
  // then send it back.
  ipc.of.ursamu.on("message", async (msg) => {
    msg = JSON.parse(msg);
    if (msg._id) mu.connections.set(msg.id, msg._id);
    const ctx = await mu.parser.process(msg);

    // If no context is returned, no need to pass anything!
    if (ctx) ipc.of.ursamu.emit("message", ctx);
  });

  // Send a Connect message to the newly opened socket!
  ipc.of.ursamu.on("muconnect", (id) =>
    mu.send.acct(id, mu.txt.get("connect"))
  );

  // perforom actions on an object's flags.
  ipc.of.ursamu.on("flags", async ({ _id, flags }) => {
    const en = await mu.db.get(_id);
    mu.flags.setFlags(en, flags);
  });
});

// Panic button pressed!
ipc.of.ursamu.on("cleanboot", async () => {
  players = await mu.db.find({
    $where: function () {
      return mu.flags.hasFlags(this, "connected");
    },
  });

  for (const player of players) {
    await mu.flags.setFlags(player, "!connected");
  }
});

mu.on("connected", async (tar) => {
  const room = await mu.db.get(tar.data.location);
  // Run login commands.

  // If the logging in character isn't dark, send a notification to the room contents.
  if (mu.flags.hasFlags(tar, "!dark")) {
    mu.send.to(
      room.data.contents.filter((item) => item !== tar._id),
      `${tar.data.moniker || tar.data.name} has connected.`
    );
  }
});

process.on("SIGINT", () => process.exit(1));
process.on("SIGTERM", () => process.exit(0));
process.on("exit", () => process.exit(0));
