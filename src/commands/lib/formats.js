module.exports = (mu) => {
  mu.command({
    name: "@nameformat",
    flags: "connected wizard+",
    category: "admin:building",
    help: `
SYNTAX: @nameformat <target> = <expression>

Change how the name of an object looks to other objects within it. 
Players in a room for instance.  When the expression is called, %0 is the 
name of the object. Other objects outside looking in, will not see the
@nameformat change.

ex.
  @nameformat here=[center(<< %0 >>,78,-)]`,
    pattern: /^@nameformat\s+?([#\w\d]+)\s?=\s?(.*)?/i,
    exec: async (ctx) => {
      const en = ctx.en;
      const tar = await mu.grid.target(en, ctx.args[1]);
      if (mu.flags.canEdit(en, tar)) {
        mu.send.to(
          en._id,
          await mu.attrs.set({
            en,
            tar,
            name: "nameformat",
            value: ctx.args[2],
          })
        );
      }
    },
  });

  mu.command({
    name: "@conformat",
    flags: "connected wizard+",
    category: "admin:building",
    help: `
SYNTAX: @conformat <target> = <expression>

Change the way the contents of an objct is displayed.  This only affects
other objects  contained in it's 'inventory'. %0 is a space seperated
list of dbrefs. 

ex.
  @conformat here=[iter(%0, name(##))]`,
    pattern: /^@conformat\s+?([#\w\d]+)\s?=\s?(.*)?/i,
    exec: async (ctx) => {
      const en = ctx.en;
      const tar = await mu.grid.target(en, ctx.args[1]);
      if (mu.flags.canEdit(en, tar)) {
        mu.send.to(
          en._id,
          await mu.attrs.set({
            en,
            tar,
            name: "conformat",
            value: ctx.args[2],
          })
        );
      }
    },
  });
};
