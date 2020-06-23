module.exports = (mu) => {
  return {
    to: async (ids, ctx, exclude = []) => {
      ids = ids.filter((id) => exclude.indexOf(id));
      // Get db data for the objects in the room
      // contents
      const contents = [];
      for (const obj of ids) {
        contents.push(await mu.db.get(obj));
      }

      // We just need the socket id to send the message too.
      const res = contents
        .filter((item) => mu.flags.hasFlags(item, "connected"))
        .map((item) => item.id)
        .join(",");

      // Send the request off to over the IPC!
      mu.ipc.of.ursamu.emit("broadcast", res, ctx.message);
    },
  };
};
