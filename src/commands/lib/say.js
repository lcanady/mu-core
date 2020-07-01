module.exports = (mu) => {
  mu.command({
    name: "say",
    flags: "connected",
    pattern: /(?:say\s|")(.*)/i,
    category: "general:basics",
    help: `
SYNTAX: say <text>
        "<text>
Say something to the other players around you!  This command will format
a message to send to the rest of the contents of the room you're occupying.

ex. "Hello World!

You would see -> You say, "Hello World!"
Everyone else -> Kumakun says, "Hello World!"`,
    exec: async (ctx) => {
      const en = await mu.db.get(ctx._id);
      const room = await mu.db.get(en.data.location);
      const contents = room.data.contents;

      mu.send.to(
        contents.filter((item) => item !== en._id),
        `${en.data.name} says, "${ctx.args[1]}%cn"`
      );

      mu.send.to([en._id], `You say "${ctx.args[1]}%cn"`);
    },
  });
};
