const { EventEmitter } = require("events");
const commands = require("../commands");
const services = require("../services");
const config = require("./config");
const parser = require("./parser");
const flags = require("./flags");
const { db } = require("./database");
const grid = require("./grid");
class MU extends EventEmitter {
  constructor(ipc) {
    super();
    this.connections = new Map();
    this.commands = [];
    this.ipc = ipc;
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

  async start() {
    const rooms = await this.db.find({
      $where: function () {
        return this.data?.flags?.indexOf("room") !== -1;
      },
    });

    if (rooms.length <= 0) {
      console.log("[UrsaMU]:", await this.grid.dig({ name: "Limbo" }));
    }

    // Configure commands
    this.configure(services).configure(commands);
  }

  async force(en, cmd, ctx) {
    return await this.parser.process({
      id: ctx.id,
      _id: en._id || ctx._id,
      command: "message",
      message: cmd,
    });
  }

  async shutdown() {
    const users = await this.db.find({
      $where: function () {
        return this.data?.flags?.indexOf("user") !== -1;
      },
    });

    const connected = users.filter((user) =>
      user?.data?.flags?.indexOf("connected")
    );

    for (const plyr of connected) {
      this.flags.setFlags(plyr, "!connected");
    }
  }
}

module.exports = MU;
