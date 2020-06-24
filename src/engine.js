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
    if (ctx) ipc.of.ursamu.emit("message", JSON.stringify(ctx));
  });
});

process.on("SIGINT", () => process.exit(1));
process.on("SIGTERM", () => process.exit(0));
process.on("exit", () => process.exit(0));
