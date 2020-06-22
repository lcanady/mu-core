const ipc = require("node-ipc");
const MU = require("./src/api/mu");

// IPC Configuration
ipc.config.id = "parser";
ipc.config.retry = 1500;

// Connect to the pubsub server.
ipc.connectTo("ursamu", () => {
  mu = new MU(ipc);
  mu.start();

  // Let the IPC system know the parser is online.
  ipc.of.ursamu.emit("parser");

  // Handle a message when it comes down the wire and
  // then send it back.
  ipc.of.ursamu.on("message", async (msg) => {
    msg = JSON.parse(msg);
    if (msg._id) mu.connections.set(msg.id, msg._id);
    const ctx = await mu.parser.process(msg);
    ipc.of.ursamu.emit("message", JSON.stringify(ctx));
  });

  // Listen for a list of already vetted connections to
  // add to the connections list.
  ipc.of.ursamu.on("avatars", (avatars) => {
    for (let [socket, avatar] of JSON.parse(avatars)) {
      mu.connections.set(socket, avatar);
    }
  });

  // I put this in the connecTo handler because I'm honestly only intersted
  // in saving connections if we've connected to the IPC.
  process.on("SIGINT", () => {
    ipc.of.ursamu.emit("shutdown", JSON.stringify(Array.from(mu.connections)));
    process.exit(0);
  });
});
