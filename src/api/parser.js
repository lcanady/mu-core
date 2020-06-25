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

  /**
   * Create a new function to add to the global list.
   * @param {string} name The name of the function to be added.
   * @param {function} fun The function to be run when the mushcode
   * parser maakes a match.
   */
  function(name, fun) {
    this.funs.set(name, fun);
  }

  /**
   * Parse a muschode string into an AST.
   * @param {string} string The string to parse
   */
  parse(string) {
    return this.peg.parse(string);
  }

  /**
   * Add a new service to the game.  Services can be thought of as
   * commands the client can send directly to the game.
   * @param {function} service The service to handle the command from
   * the client.
   */
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

  /**
   * Evaluate a parsed mushcode AST.
   * @param {Object} en The database object of the enactor
   * @param {Object} expr The parsed expression to be evaluated.
   * @param {Object} scope The context for the run of the expression.
   */
  async evaluate(en, expr, scope) {
    // If the expression is a word, return it's value in scope, else
    // just the value of the expression.
    if (expr.type === "word") {
      return scope[expr.value] || expr.value;
    } else if (expr.type === "function") {
      // If the expression is a function, search for it to see if it
      // exists first.
      const name = expr.operator.value;
      if (this.funs.has(name)) {
        return await this.funs.get(name)(en, expr.args, scope);
      } else {
        throw new Error("Unknown Function");
      }
    } else if (expr.type === "list") {
      // A list happens when two or more expressions are placed
      // next to each other.  They are each evaluated and their
      // output is concatinated together.
      let output = "";
      for (const expression of expr.args) {
        output += await this.evaluate(en, expression, scope);
      }
      return output;
    } else {
      throw new Error("Unknown expression");
    }
  }
}

module.exports = new Parser();
