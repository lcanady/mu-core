module.exports = (mu) => {
  mu.command({
    name: "connect",
    pattern: /connect\s+?(.*)\s+?(.*)/i,
    flags: "!connected",
    exec: (en, args, scope) => {},
  });
};
