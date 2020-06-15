module.exports = (mu) => {
  mu.parser.service({
    name: "message",
    exec: async (ctx) => {
      for (const command of mu.commands) {
        // Check to see if the ctx message matches the command.
        const match = command.pattern.exec(ctx.message);
        ctx.args = match;
        // If there's a match make sure the ctx user
        if (match && mu.flags.hasFlags(ctx.user, command.flags)) {
          // Run the command and return the ctx object.
          return command.exec(ctx);
        }

        // No match, if the user is logged in send a 'huh' message.
        // If not send nothing.
        if (mu.flags.hasFlags(ctx.user, "connected")) {
          ctx.message = "Huh? Type help for help.";
        } else {
          ctx.message = "";
        }

        // Return the context object.
        return ctx;
      }
    },
  });
};
