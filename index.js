const ipc = require("node-ipc");
const { createServer } = require("net");
const config = require("./src/api/config");
const User = require("./src/api/transport");
const { exec, spawn } = require("child_process");
const { readFile } = require("fs");
const { resolve } = require("path");

ipc.config.id = "ursamu";
ipc.config.retry = 1500;

let parser = spawn("node", ["engine.js"]);
let connections = [];
let avatars;
// Create an inter-process communication channel.
// this way the game engine can be rebooted when need be
// and not kick anyone's connection no matter how they're
// connected.
ipc.serve(() => {
  //Start the TCP server for telnet connections.
  const tcpServer = createServer((socket) => {
    const user = new User(socket);
    connections.push(user);
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
          command: "message",
          message: data.toString(),
        })
      );
    });

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
  ipc.server.on("message", (ctx) => {
    ctx = JSON.parse(ctx);
    const user = connections.find((conn) => conn.id === ctx.id);
    if (user) user.write(ctx);
  });

  // When the parser shuts down, pass the authenticated
  // socket/avatar pairs.
  ipc.server.on("shutdown", (list) => {
    avatars = JSON.parse(list);
  });

  // When the parser comes back up, send the list back.
  ipc.server.on("parser", (msg, socket) => {
    // Send the connections back to the parser if there are any.
    if (avatars) ipc.server.emit(socket, "avatars", JSON.stringify(avatars));
    ipc.log("Parser connected.");
  });

  ipc.server.on("reboot", (ids) => {
    ids = ids.split(",");
    const users = connections.filter((conn) => ids.indexOf(conn.id) !== -1);
    users.forEach((user) =>
      user.write({ message: "Game: Reboot initiated, please wait ..." })
    );

    parser.kill();
    parser.on("close", () => {
      parser = spawn("node", ["engine.js"]);
    });

    users.forEach((user) => user.write({ message: "Game: Reboot completed." }));
  });
});

ipc.server.start();

process.on("exit", () => {
  parser.kill();
});
