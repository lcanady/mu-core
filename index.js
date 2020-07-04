const ipc = require("node-ipc");
const { createServer } = require("net");
const config = require("./src/api/config");
const User = require("./src/api/transport");
const { spawn } = require("child_process");
const { readFile } = require("fs");
const { resolve } = require("path");

ipc.config.id = "ursamu";
ipc.config.retry = 1500;

let parser = spawn("node", ["--inspect", "./src/engine.js"]);
let connections = [];
let avatars = new Map();

// Create an inter-process communication channel.
// this way the game engine can be rebooted when need be
// and not kick anyone's connection no matter how they're
// connected.
ipc.serve(() => {
  // Helper function to get user object info from a #DBREF.
  const getUser = (id) =>
    connections.filter((conn) => avatars.get(conn.id) === id);

  // Start the TCP server for telnet connections after the IPC
  // channel loads..
  const tcpServer = createServer((socket) => {
    // create a new user wrapper for the sockets coming through
    const user = new User(socket);

    // Add the connection to the connections array.
    connections.push(user);

    // Send the connect screen message.
    ipc.server.broadcast("muconnect", user.id);

    // Handle new messages that come in from the socket.
    socket.on("data", (data) => {
      // Send the request from the socket over the IPC to the
      // game engi`ne formated as a context `ctx` request.
      ipc.server.broadcast(
        "message",
        JSON.stringify({
          id: user.id,
          _id: avatars.has(user.id) ? avatars.get(user.id) : "",
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
  ipc.server.on("message", ({ id, message }) => {
    const user = connections.find((conn) => conn.id === id);
    if (user) user.write({ message });
  });

  // Send a message to an array of sockets, or a single socket.
  ipc.server.on("send", (msg) => {
    if (msg?.ids) {
      if (Array.isArray(msg.ids)) {
        // If a list of ids is given, send to that list
        if (msg.ids.length > 0) {
          msg.ids.forEach((id) => {
            const users = getUser(id);
            if (users.length > 0)
              users.forEach((user) => user.write({ message: msg.message }));
          });
        }
      } else {
        const users = getUser(msg.ids);
        if (users.length > 0)
          users.forEach((user) => user.write({ message: msg.message }));
      }
    }
  });

  // Send to all sockets.
  ipc.server.on("broadcast", ({ message }) =>
    connections.forEach((user) => user.write({ message }))
  );

  // Send to a socket that doesn't have an _id yet.
  ipc.server.on("acct", ({ id, message }) => {
    const user = connections.find((conn) => conn.id === id);
    if (user) user.write({ message });
  });

  // Shut the game down safely!
  ipc.server.on("shutdown", () => {
    parser.kill("SIGTERM");
    process.exit(0);
  });

  // When a socket quits, send a mess age and disconnect the socket.
  // This is a little tricky, because someone could techinically be
  // connected to the same character through multiple ports.
  // If this is the case, we need to make sure we're only disconnecting
  // the currrent port, and not changing the status of any others.
  ipc.server.on("quit", (id) => {
    const dbref = avatars.get(id);
    let users = getUser(dbref);
    if (users.length <= 1) {
      // If the user has an associated avatar, remove it, and request
      // to remove the connected flag from the socket - only if there
      // are no more connected to that
      users.forEach((user) => avatars.delete(user.id));
      connections = connections.filter((conn) => conn.id !== id);
      ipc.server.broadcast("flags", { _id: dbref, flags: "!connected" });
      users[0].end({ message: "See you, space cowboy ..." });
    } else if (users.length > 1) {
      // More than one connection to the game through this dbref at the
      // moment.  Disconnect the current connection without removing
      // the connected flag.
      users.forEach(() => avatars.delete(id));
      const user = users.find((user) => user.id === id);
      connections = connections.filter((conn) => conn.id !== id);
      user.end({ message: "See you, space cowboy ..." });
    }
  });

  // The user has been authenitcated.  Make a reference to link
  // their socket ID and Avatar ID.
  ipc.server.on("authenticated", (ids) => {
    const [avatarID, SocketID] = JSON.parse(ids);
    avatars.set(SocketID, avatarID);
  });

  // When a Reboot call is made, kill the engine process.
  ipc.server
    .on("reboot", (name) => {
      let users = Array.from(avatars.keys());
      users
        .map((id) => getUser(avatars.get(id)))
        .forEach((user) =>
          user[0].write({
            message: `%chGame:%cn Reboot initiated by ${name}, please wait ...`,
          })
        );

      parser.kill("SIGTERM");
      parser.on("exit", () => {
        parser = spawn("node", ["--inspect", "./src/engine.js"]);
        users
          .map((id) => getUser(avatars.get(id)))
          .forEach((user) =>
            user[0].write({ message: "%chGame:%cn Reboot completed." })
          );
      });
    })
    .on("error", (err) => console.log(err));
});

ipc.server.start();
