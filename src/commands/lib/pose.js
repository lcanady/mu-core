module.exports = (mu) => {
  mu.command({
    name: "pose",
    flags: "connected",
    category: "general:basics",
    help: `
SYNTAX: pose <text>
        :<text>
        ;<text>

  Pose sends a message to your current location, that's prepended to the 
  text. The first and second forms will place a space between the character
  name and the text.  The third will not.

  ex.
    pose tests     ->  Kumakun tests.
    :loves to code ->  Kumakun loves to code.
    ;, cool guy.   ->  Kumakun, cool guy.`,
    pattern: /^(pose\s|:|;)(.*)/i,
    exec: async (ctx) => {
      const en = await mu.db.get(ctx._id);
      const room = await mu.db.get(en.data.location);
      let message = "";
      // Format the message
      switch (ctx.args[1].toLowerCase()) {
        case ";":
          message = `${en.data.moniker ? en.data.moniker : en.data.name}${
            ctx.args[2]
          }`;
          break;
        default:
          message = `${en.data.moniker ? en.data.moniker : en.data.name} ${
            ctx.args[2]
          }`;
          break;
      }

      // Send it off to everyone.
      mu.send.to(room.data.contents, message);
    },
  });
};
