const peg = require("pegjs");
const { readFileSync } = require("fs");
const { resolve } = require("path");

// The parser class handles the translation of strings to mushcode.
// By default it handles MUSH, but it could honestly handle any
// pegjs grammar we throw at it.  Just for future reference!
class Parser {
  constructor() {
    this.funs = new Map();
    this.services = [];
    const grammar = readFileSync(resolve(__dirname, "./mushcode.pegjs"), {
      encoding: "utf-8",
    });
    this.peg = peg.generate(grammar);
  }

  function(name, fun) {
    this.funs.set(name, fun);
  }

  parse(string) {
    return this.peg.parse(string);
  }

  service(service) {
    this.services.push(service);
    return this;
  }

  /**
   * Process an action from the client.
   * @param {Object} ctx The context object
   */
  async process(ctx) {
    for (const service of this.services) {
      if (service.name === ctx.command.toLowerCase()) {
        return await service.exec(ctx);
      }
    }
  }
}

module.exports = new Parser();
