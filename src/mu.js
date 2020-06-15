const { EventEmitter } = require("events");
const { createServer } = require("net");
const commands = require("./commands");
const services = require("./services");
const parser = require("./api/parser");
const flags = require("./api/flags");
const { db } = require("./api/database");

class MU extends EventEmitter {
  constructor() {
    super();
    this.connections = new Map();
    this.commands = [];
    this.parser = parser;
    this.flags = flags;
    this.db = db;
  }

  configure(module) {
    module(this);
    return this;
  }

  command(cmd) {
    this.commands.push(cmd);
    return this;
  }

  /**
   * Start the main data transports
   */
  start() {
    const tcp = createServer(require("./api/tcpHandler")(this));

    // Configure commands
    this.configure(services);
    this.configure(commands);

    // Start TCP service
    tcp.listen(4000, () => console.log("[UrsaMU]: TCP Server Started."));
  }
}

const mu = new MU();
mu.start();

module.exports = mu;
