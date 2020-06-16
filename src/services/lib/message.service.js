module.exports = (mu) => {
  mu.parser.service({
    name: "message",
    exec: async (ctx) => {
      for (const command of mu.commands) {
        // Check to see if the ctx message matches the command.
        const match = command.pattern.exec(ctx.message);
        ctx.args = match;

        // If there's a match make sure the ctx user
        if (match && (await mu.flags.hasFlags(ctx.user, command.flags))) {
          // Run the command and return the ctx object.
          return command.exec(ctx);
        }
      }
      // No match, if the user is logged in send a 'huh' message.
      // If not send nothing.
      if ((await mu.flags.hasFlags(ctx.user, "connected")) && !ctx.matched) {
        ctx.message = "Huh? Type help for help.";
        ctx.user.write(ctx);
      } else {
        ctx.message = "";
      }
      // Return the context object.
      return ctx;
    },
  });
};
