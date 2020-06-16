const { EventEmitter } = require("events");
const { createServer } = require("net");
const commands = require("../commands");
const services = require("../services");
const parser = require("./parser");
const flags = require("./flags");
const { db } = require("./database");

class MU extends EventEmitter {
  constructor() {
    super();
    this.connections = [];
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
  async start() {
    const players = await this.db.find({
      $where: function () {
        return this.data?.flags.indexOf("player") !== -1;
      },
    });

    const connected = players.filter((player) =>
      player.data.flags.indexOf("connected")
    );

    for (const plyr of connected) {
      const idx = player.data.flags.indexOf("connected");
      player.data.flags.splice(idx);
      await this.db.update(player._id, player);
    }

    const tcp = createServer(require("./tcpHandler")(this));

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
