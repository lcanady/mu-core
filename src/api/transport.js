const { EventEmitter } = require("events");

// We need an adapter that can handle user connections independant of where they come from
// TCP/WebSocket.
module.exports = class User extends EventEmitter {
  constructor(socket) {
    super();
    this.socket = socket;
  }

  write(ctx) {
    this.socket.write(ctx.message + "\r\n");
  }

  done(ctx) {
    this.socket.end(ctx.message + "\r\n");
  }
};
