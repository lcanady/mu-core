const uuid = require("uuid");
const { readFile } = require("fs");
const { resolve } = require("path");
const User = require("./transport");

module.exports = (mu) => {
  const handler = (socket) => {
    socket.id = uuid.v4();
    const user = new User(socket);

    readFile(resolve(__dirname, "../../text/connect.txt"), (err, buff) => {
      if (err) {
        console.error(err);
        socket.end("Connect Message Missing.");
      }
      socket.write(buff.toString() + "\r\n");
    });

    socket.on("data", (b) =>
      mu.parser.process({
        user,
        command: "message",
        message: b.toString(),
      })
    );
  };

  return handler;
};
