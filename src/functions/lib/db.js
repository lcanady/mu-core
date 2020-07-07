module.exports = (mu) => {
  // Syntax: name(<dbref>)
  mu.parser.function("name", async (en, args, scope) => {
    const text = await mu.parser.evaluate(en, args[0], scope);
    const tar = await mu.db.get(text);

    return tar ? mu.grid.name(en, tar) : "#-1 NOT FOUND";
  });
};
