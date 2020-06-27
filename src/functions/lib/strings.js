module.exports = (mu) => {
  const parser = mu.parser;
  /**
   * Find the remainder for string length.
   * @param {string} string The string to process.
   * @param {number} length The length of the string.
   */
  const remainder = (string = "", length) =>
    Math.floor(length % parser.stripSubs(string).length);

  /**
   * Repeat a string.
   * @param {string} string The string to repeat.
   * @param {number} length The length to repeat.
   */
  const repeatString = (string = "", length) => {
    let cleanArray = string.split("%").filter(Boolean);

    cleanArray =
      cleanArray.length > 1
        ? cleanArray
            .filter((cell) => (cell.toLowerCase() !== "cn" ? true : false))
            .map((cell) => "%" + cell + "%cn")
        : cleanArray[0].split("");

    return (
      string.repeat(length / parser.stripSubs(string).length) +
      cleanArray.slice(0, remainder(string, length))
    );
  };

  // Add padding to a string.
  parser.function("padding", async (en, args, scope) => {
    if (args.length < 2) {
      throw new SyntaxError("padding requires at least 2 arguments");
    } else {
      const message = args[0]
        ? await parser.evaluate(en, args[0], scope)
        : "#-1 NO MESSAGE PROVIDED";
      const width = args[1]
        ? parseInt(await parser.evaluate(en, args[1], scope), 10)
        : "#-2 WIDTH IS REQUIRED";
      const repeat = args[2] ? await parser.evaluate(en, args[2], scope) : " ";
      const type = args[3]
        ? (await parser.evaluate(en, args[3], scope)).toLowerCase()
        : "left";
      const length = (width - parser.stripSubs(message).length) / 2;
      const remainder = (width - parser.stripSubs(message).length) % 2;

      switch (type) {
        case "center":
          return (
            repeatString(repeat, length) +
            message +
            repeatString(repeat, length + remainder)
          );
        case "left":
          return message + repeatString(repeat, length * 2);
        case right:
          return repeatString(repeat, length * 2) + message;
        default:
          return (
            repeatString(repeat, length) +
            message +
            repeatString(repeat, length + remainder)
          );
      }
    }
  });

  // Columns
  parser.function("columns", async (en, args, scope) => {
    if (args.length < 2) {
      return "#-1 columns expects 2 arguments";
    }
    let indent, delim;
    const list = await parser.evaluate(en, args[0], scope);
    const width = parseInt(await parser.evaluate(en, args[1], scope));
    if (args[2]) {
      delim = await parser.evaluate(en, args[2], scope);
    } else {
      delim = " ";
    }

    if (args[3]) {
      indent = parseInt(await parser.evaluate(en, args[3], scope));
    } else {
      indent = 0;
    }
    let output = "";
    let line = "";
    // Start working with the main list.
    list.split(delim).forEach((item) => {
      if (indent + line.length + item.length >= 78) {
        line += "%r" + " ".repeat(indent) + item.padEnd(width);
        output += line;
        line = "";
      } else {
        line += item.padEnd(width);
      }
    });
    // Tack the last line onto the end! ^_^
    return "%s".repeat(indent) + output + line;
  });
};
