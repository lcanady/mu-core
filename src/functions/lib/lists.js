module.exports = (mu) => {
  // iter(<list>,<action>[,<idelm>][,<odelim>])
  mu.parser.function("iter", async (en, args, scope) => {
    let list = await mu.parser.evaluate(en, args[0], scope);
    let action = args[1];
    const idelim =
      args[2].value !== null
        ? await mu.parser.evaluate(en, args[2], scope)
        : " ";
    const odelim = args[3] ? await mu.parser.evaluate(en, args[3], scope) : " ";
    list = list.split(idelim);
    let res = [];

    // Iterate through each item of list, and evaluate it against the
    // action.
    for (let item of list) {
      res.push(
        await mu.parser.evaluate(en, action, { ...scope, ...{ "##": item } })
      );
    }
    return res.join(odelim);
  });
};
