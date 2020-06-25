module.exports = (mu) => {
  // Add a list of numbers together.
  mu.parser.function("add", async (en, args, scope) => {
    let count = 0;
    for (let arg of args) {
      let num = await mu.parser.evaluate(en, arg, scope);
      count += parseInt(num) || num;
    }
    return count;
  });
};
