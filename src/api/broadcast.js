module.exports = (mu) => {
  return {
    to: async (objs, ctx, exclude = []) => {
      objs = objs.filter((obj) => exclude.indexOf(obj));
      // Get db data for the objects in the room
      // contents
      const contents = [];
      for (const obj of objs) {
        contents.push(await mu.db.get(obj));
      }

      contents
        .filter((item) => mu.flags.hasFlags(item, "connected"))
        .forEach((item) => {
          socket = mu.connections.find((socket) => socket._id === item._id);
          socket.write(ctx);
        });
    },
  };
};
