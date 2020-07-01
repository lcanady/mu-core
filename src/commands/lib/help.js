module.exports = (mu) => {
  mu.command({
    name: "help",
    flags: "connected",
    hidden: true,
    pattern: /^[\+@]?help(?:\s+?(.*))?/i,
    exec: async (ctx) => {
      let screen = "";

      screen +=
        "[padding(%ch%cb=%cn %chHELP SYSTEM INDEX %cb=%cn,78,%cb-%cn,center)]%r";
      for (const cat of mu.help.categories) {
        if (
          mu.flags.hasFlags(
            ctx.en,
            mu.help.locks[cat.toLowerCase()] || "connected"
          )
        ) {
          screen += `[padding(%ch%cb=%cn %ch${cat.toUpperCase()} %cb=%cn,78,%cb-%cn,center)]%r`;
          screen += `[columns(${mu.help.system[cat]
            .map((topic) => topic.name)
            .join("|")},19,|)]%r`;
        }
      }
      screen +=
        "[repeat(%cb-%cn,78)]%rType '%chhelp <topic>%cn' for more help.";

      if (!ctx.args[1]) {
        mu.send.to(ctx._id, await mu.parser.run(ctx.en, screen, mu.scope));
      } else {
        if (mu.help.entries.indexOf(ctx.args[1].toLowerCase()) >= 0) {
          let topic, subTopic;
          for (const cat of mu.help.categories) {
            const match = mu.help.system[cat].find(
              (item) => item.name === ctx.args[1].toLowerCase()
            );
            if (match) topic = match;
          }
          if (topic) {
            subTopic = mu.help.system[topic.category].filter(
              (tpc) =>
                topic?.subCategory === tpc?.subCategory &&
                topic.name !== tpc.name
            );

            let output = `[padding(%ch%cb=%cn %chHELP ${topic.name.toUpperCase()} %cb=%cn,78,%cb-%cn,center)]%r`;
            output += `${topic.text
              .replace(/\n/g, "%r")
              .replace(/\[/g, "%[")
              .replace(/\]/g, "%]")
              .replace(/\(/g, "%(")
              .replace(/\)/g, "%)")
              .replace(/,/g, "%,")}%r`;
            if (subTopic.length > 0) {
              output += `%rRelated Topics: ${subTopic
                .map((topic) => topic.name)
                .join("%, ")}%r`;
            }
            output += `[repeat(%cb-%cn,78)]`;

            mu.send.to(ctx._id, await mu.parser.run(ctx.en, output, mu.scope));
          } else {
            mu.send.to(ctx._id, "I can't find a help file on that topic.");
          }
        } else {
          mu.send.to(ctx._id, "I can't find a help file on that topic.");
        }
      }
    },
  });
};
