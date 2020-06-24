const { EventEmitter } = require("events");
const { v4 } = require("uuid");
const { ansiSubs } = require("./ansi");

// We need an adapter that can handle user connections independant of where they come from
// TCP/WebSocket.
module.exports = class User extends EventEmitter {
  constructor(socket) {
    super();
    this.socket = socket;
    this.id = v4();
  }

  write(ctx) {
    if (ctx.message !== "") this.socket.write(ansiSubs(ctx.message) + "\r\n");
  }

  end(ctx) {
    this.socket.end(ansiSubs(ctx.message) + "\r\n");
  }
};
