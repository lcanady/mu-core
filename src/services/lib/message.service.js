module.exports = (mu) => {
  mu.parser.service({
    name: "message",
    exec: async (ctx) => {
      const en = (await mu.db.get(ctx._id)) || {};
      for (const command of mu.commands) {
        // Check to see if the ctx message matches the command.
        const match = command.pattern.exec(ctx.message);
        ctx.args = match;

        // If there's a match make sure the ctx user
        if (match && mu.flags.hasFlags(en, command.flags)) {
          const en = await mu.db.get(ctx._id);
          ctx.en = en;
          // Run the command and return the ctx object.
          return command.exec(ctx);
        }
      }
      // No match, if the user is logged in send a 'huh' message.
      // If not send nothing.
      if (
        mu.flags.hasFlags(en, "connected") &&
        !ctx.matched &&
        ctx.message.trim() !== ""
      ) {
        ctx.message = "Huh? Type help for help.";
        return ctx;
      }
    },
  });
};
