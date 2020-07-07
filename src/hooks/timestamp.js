module.exports = async (ctx) => {
  ctx.data.timestamp = date.now();
  return ctx;
};
