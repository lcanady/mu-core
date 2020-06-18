const { createServer } = require("net");
const tcpHandler = require("./tcpHandler");
const { v4 } = require("uuid");
const { readFile } = require("fs");
const { resolve } = require("path");

// Create the needed servers seperately from
// The game process, in case the server itsself needs
// be rebooted.  This way connections aren't lost!
let connections = [];

createServer((socket) => {
  // Give the socket an id to reference later and add
  // it to the list of connections.
  socket.id = v4();
  connections.push(socket);

  // When a new TCP socket connects, send it the connect screen.
  socket.on("connect", () =>
    readFile(resolve(__dirname, "../../text/connect.txt"), (err, b) => {
      if (err) socket.done("Unable to display welcome.  Aborting.");
      socket.write(b.toString() + "\r\n");
    })
  );

  // When a connection is closed, remove it from the
  // global connection list.
  socket.on("close", () => {
    connections = connections.filter((conn) => conn.id !== socket.id);
  });

  // When data comes from the socket, format a message
  // to send to the game engine for processing.
  socket.on("data", (data) =>
    process.send(
      JSON.stringify({
        id: socket.id,
        command: "message",
        message: data.toString(),
      })
    )
  );
});
