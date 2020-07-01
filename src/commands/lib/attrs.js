module.exports = (mu) => {
  mu.command({
    name: "attributes",
    category: "general",
    help: `
SYNTAX: &<attribute> <object> = [<value>]

Set or removes an attribute on objects you can edit. Attributes are used to
hold accessable data about, variables, and even functions. When the value is
left empty, it removes the attribute from your character object.

ex. 
  &dexterity me=14
  &foobar me=

The first command would set the attribute 'dexterity' on your character
object to 14. The second command would remove the attribute foobar.`,
    flags: "connected",
    pattern: /^&(.*)\s(.*)\s?=\s?(.*)?/i,
    exec: async (ctx) => {
      // First, check to see if the enactor has permissions to
      // set an attribute on the object.
      const tar = await mu.grid.target(ctx.en, ctx.args[2]);
      if (tar && mu.flags.canEdit(ctx.en, tar)) {
        mu.send.to(
          ctx._id,
          // Set the attribute and return a message if the
          // attempt was successful or not!
          await mu.attrs.set({
            en: ctx.en,
            tar,
            name: ctx.args[1],
            value: ctx.args[3],
          })
        );
      } else {
        mu.send.to(ctx._id, "Permission denied.");
      }
    },
  });
};
