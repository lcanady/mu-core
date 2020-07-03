const { EventEmitter } = require("events");
const commands = require("../commands");
const services = require("../services");
const functions = require("../functions");
const config = require("./config");
const parser = require("./parser");
const flags = require("./flags");
const { db } = require("./database");
const grid = require("./grid");
const broadcast = require("./broadcast");
const { readFileSync, readdirSync } = require("fs");
const { resolve } = require("path");
const { help } = require("./text");
const attrs = require("./attributes");

class MU extends EventEmitter {
  constructor(ipc) {
    super();
    this.scope = {};
    this.connections = new Map();
    this.txt = new Map();
    this.commands = [];
    this.ipc = ipc;
    this.config = config;
    this.parser = parser;
    this.flags = flags;
    this.help = help;
    this.db = db;
    this.grid = grid(this);
    this.send = broadcast(this);
    this.attrs = attrs(this);
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
        return this.flags.indexOf("room") !== -1;
      },
    });

    if (rooms.length <= 0) {
      console.log("[UrsaMU]:", await this.grid.dig({ name: "Limbo" }));
    }

    // Configure commands
    this.configure(services).configure(commands).configure(functions);

    // Read the text files directory.
    const files = readdirSync(resolve(__dirname, "../../text"), {
      withFileTypes: true,
    });

    // Add any file that ends in txt into memory.
    for (const file of files) {
      if (file.name.endsWith(".txt")) {
        const txt = readFileSync(
          resolve(__dirname, "../../text/" + file.name),
          { encoding: "utf-8" }
        );

        // Add the file into the map.
        this.txt.set(file.name.split(".")[0].toLowerCase(), txt);
      }
    }

    // Load help from the in-game commands.
    for (const cmd of this.commands) {
      if (cmd.help) {
        help.add({
          name: cmd.name,
          category: cmd.category,
          text: cmd.help.trim(),
        });
      }
    }
  }

  async force(en, cmd, ctx) {
    return await this.parser.process({
      id: ctx.id,
      _id: en._id || ctx._id,
      command: "message",
      message: cmd,
    });
  }
}

module.exports = MU;
