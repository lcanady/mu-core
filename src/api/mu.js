const { EventEmitter } = require("events");
const { createServer } = require("net");
const commands = require("../commands");
const services = require("../services");
const config = require("./config");
const parser = require("./parser");
const flags = require("./flags");
const { db } = require("./database");
const grid = require("./grid");

class MU extends EventEmitter {
  constructor() {
    super();
    this.connections = [];
    this.commands = [];
    this.config = config;
    this.parser = parser;
    this.flags = flags;
    this.db = db;
    this.grid = grid(this);
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
        return this.data?.flags?.indexOf("user") !== -1;
      },
    });

    const connected = players.filter((player) =>
      player?.data?.flags?.indexOf("connected")
    );

    for (const plyr of connected) {
      this.flags.setFlags(plyr, "!connected");
    }

    const rooms = await this.db.find({
      $where: function () {
        return this.data?.flags?.indexOf("room") !== -1;
      },
    });

    if (rooms.length <= 0) {
      console.log("[UrsaMU]:", (await this.grid.dig({ name: "Limbo" })).trim());
    }

    const tcp = createServer(require("./tcpHandler")(this));

    // Configure commands
    this.configure(services);
    this.configure(commands);
    // Start TCP service
    tcp.listen(mu.config.tcp.port, () =>
      console.log(`[UrsaMU]: TCP Server Started on Port ${mu.config.tcp.port}.`)
    );
  }
}

const mu = new MU();
module.exports = mu;
