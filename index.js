const ipc = require("node-ipc");
const { createServer } = require("net");
const config = require("./src/api/config");
const User = require("./src/api/transport");
const { exec, spawn } = require("child_process");
const { readFile } = require("fs");
const { resolve } = require("path");

ipc.config.id = "ursamu";
ipc.config.retry = 1500;

// let parser = spawn("node", ["--inspect", "engine.js"]);
let connections = [];
let avatars = new Map();

// Create an inter-process communication channel.
// this way the game engine can be rebooted when need be
// and not kick anyone's connection no matter how they're
// connected.
ipc.serve(() => {
  // Helper function to get user object info from a #DBREF.
  const getUser = (id) =>
    connections.find((conn) => avatars.get(conn.id) === id);

  // Start the TCP server for telnet connections after the IPC
  // channel loads..
  const tcpServer = createServer((socket) => {
    // create a new user wrapper for the sockets coming through
    const user = new User(socket);

    // Add the connection to the connections array.
    connections.push(user);

    // Send the connect screen message.
    readFile(resolve(__dirname, "./text/connect.txt"), (err, b) => {
      if (err) socket.end("Unable to load login screen.\r\n");
      user.write({ message: b.toString() });
    });

    // Handle new messages that come in from the socket.
    socket.on("data", (data) => {
      // Send the request from the socket over the IPC to the
      // game engi`ne formated as a context `ctx` request.
      ipc.server.broadcast(
        "message",
        JSON.stringify({
          id: user.id,
          _id: avatars.get ? avatars.get(user.id) : "",
          command: "message",
          message: data.toString(),
        })
      );
    });

    // When a socket disconnects, remove it from the list.
    socket.on("close", () => {
      connections = connections.filter((conn) => conn.id !== socket.id);
    });
  });

  // Start the TCP server.
  tcpServer.listen(config.tcp.port, () =>
    ipc.log(`TCP server connected on port ${config.tcp.port}`)
  );

  // When a message comes from the message channel
  // subscriber, send the data to the appropriate
  // sockets.
  ipc.server.on("message", (msg) => {
    ctx = JSON.parse(msg);
    const user = connections.find((conn) => conn.id === ctx.id);
    if (user) user.write(ctx);
  });

  // Send a message to an array of sockets.
  ipc.server.on("broadcast", (msg) => {
    msg = JSON.parse(msg);
    msg.ids.forEach((id) => {
      const user = getUser(id);
      if (user) user.write({ message: msg.message });
    });
  });

  // When a socket quits, send a mess age and disconnect the socket.
  ipc.server.on("quit", (id) => {
    const user = getUser(id);
    if (user) {
      avatars.delete(user.id);
      connections = connections.filter((conn) => conn.id !== user.id);
      user.end({ message: "See you, space cowboy ..." });
    }
  });

  // The user has been authenitcated.  Make a reference to link
  // their socket ID and Avatar ID.
  ipc.server.on("authenticated", (ids) => {
    const [avatarID, SocketID] = JSON.parse(ids);
    avatars.set(SocketID, avatarID);
    console.log(avatars);
  });

  // When a Reboot call is made, kill the engine process.
  ipc.server.on("reboot", (name) => {
    const users = Array.from(avatars.keys())
      .map((id) => getUser(avatars.get(id)))
      .forEach((user) =>
        user.write({
          message: `Game: Reboot initiated by ${name}, please wait ...`,
        })
      );

    // parser.kill();
    // parser = spawn("node", ["--inspect", "engine.js"]);

    users.forEach((user) => user.write({ message: "Game: Reboot completed." }));
  });
});

ipc.server.start();
