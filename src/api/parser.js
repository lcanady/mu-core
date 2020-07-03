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
    service.hooks = new Map();
    service.hooks.set("before", []);
    service.hooks.set("after", []);
    this.services.push(service);
    return this;
  }

  /**
   * Attach a hooks to a service.
   * @param {string} when 'before' or 'after ' the service has run
   * @param {string} name The name of the servicce to attach too.
   * @param  {...any} hooks The list of hooks to assign to a service
   */
  hooks(name, when, ...hooks) {
    srv = this.services.find((service) => service.name === name);
    // if the service exists and the 'when' is either before or after.
    if (srv && srv.hooks.has(when)) {
      // For each hook, push it into the proper stack.
      hooks.forEach((hook) => srv.hooks.get(when).push(hook));
    }
  }

  /**
   * Process an action from the client.
   * @param {Object} ctx The context object
   */
  async process(ctx) {
    for (const service of this.services) {
      if (service.name === ctx.command.toLowerCase()) {
        for (const bhook of service.hooks.get("before")) {
          ctx = await bhook(ctx);
        }

        ctx = await service.exec(ctx);

        for (const bhook of service.hooks.get("after")) {
          ctx = await bhook(ctx);
        }

        return ctx;
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

  /**
   * Strip MUSH ansi subsitution shorthand from a string.
   * @param {string} string - The text to strip the substitution
   * characters from.
   */
  stripSubs(string) {
    return string
      .replace(/%[cCxX]./g, "")
      .replace(/&lpar;/g, " ")
      .replace(/&rpar;/g, " ")
      .replace(/&#91;/g, " ")
      .replace(/&#93;/g, " ");
  }

  async run(en, string, scope) {
    string = string
      .replace(/%\(/g, "&lpar;")
      .replace(/%\)/g, "&rpar;")
      .replace(/%\[/g, "&#91;")
      .replace(/%\]/g, "&#93;")
      .replace(/%,/g, "&#44;");

    try {
      return await this.evaluate(en, this.parse(string), scope);
    } catch (error) {
      return await this.string(en, string, scope);
    }
  }

  async string(en, text, scope) {
    let parens = -1;
    let brackets = -1;
    let match = false;
    let workStr = "";
    let output = "";
    let start = -1;
    let end = -1;

    // Loop through the text looking for brackets.
    for (let i = 0; i < text.length; i++) {
      if (text[i] === "[") {
        brackets = brackets > 0 ? brackets + 1 : 1;
        start = start > 0 ? start : i;
        match = true;
      } else if (text[i] === "]") {
        brackets = brackets - 1;
      } else if (text[i] === "(") {
        parens = parens > 0 ? parens + 1 : 1;
      } else if (text[i] === ")") {
        parens = parens - 1;
      }

      // Check to see if brackets are evenly matched.
      // If so process that portion of the string and
      // replace it.
      if (match && brackets !== 0 && parens !== 0) {
        workStr += text[i];
      } else if (match && brackets === 0 && parens === 0) {
        // If the brackets are zeroed out, replace the portion of
        // the string with evaluated code.
        workStr += text[i];
        end = i;

        // If end is actually set (We made it past the first characracter),
        // then try to parse `workStr`.  If it won't parse (not an expression)
        // then run it through string again just to make sure.  If /that/ fails
        // error.
        if (end) {
          let results = await this.run(en, workStr, scope).catch(async () => {
            output += await this.string(en, workStr, scope).catch(console.log);
          });
          // Add the results to the rest of the processed string.
          output += results;
        }

        // Reset the count variables.
        parens = -1;
        brackets = -1;
        match = false;
        start = -1;
        end = -1;
        workStr = "";
      } else {
        // If stray paren or bracket slips through, add it to `workStr`
        // else add it right to the output.  There's no code there.
        if (text[i].match(/[\[\]\(\)]/)) {
          workStr += text[i];
        } else {
          output += text[i];
        }
      }
    }
    // Return the evaluated text
    return output ? output : workStr;
  }
}

module.exports = new Parser();
