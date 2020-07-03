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
  ipc.of.ursamu.on("flags", async ({ id, flags }) => {
    const en = await mu.db.get(id);
    mu.flags.setFlags(en, flags);
  });
});

process.on("SIGINT", () => process.exit(1));
process.on("SIGTERM", () => process.exit(0));
process.on("exit", () => process.exit(0));
