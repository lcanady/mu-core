module.exports = (mu) => {
  /**
   * Create a base database entity.
   * @param {string} enDbref
   * @param {string} name
   */
  const baseObj = async (name) => {
    const data = {
      _id: `#${await mu.db.count()}`,
      data: { name },
    };
    return await mu.db.create(data);
  };

  /**
   * Create a base database object, based on the entered type:
   * user, room, exit or thing.
   * @param {string} name The name of the new entity.
   * @param {"user" | "room" | "exit" | "thing"} type The type of entity
   * to create.
   */
  const entity = async (name, type = "thing") => {
    const obj = await baseObj(name);
    switch (type.toLowerCase()) {
      case "thing":
        await mu.flags.setFlags(obj, "object");
        break;
      case "user":
        await mu.flags.setFlags(obj, "object user");
        break;
      case "room":
        await mu.flags.setFlags(obj, "object room");
        break;
      case "exit":
        await mu.flags.setFlags(pbj, "object exit");
        break;
      default:
        throw new Error("Unknown Object Type");
    }
    return obj;
  };

  class Gr1d {
    async name(en, tar) {
      if (en === "") en = tar;
      const target = await mu.db.get(tar);
      const enactor = await mu.db.get(en);

      const edit = await mu.flags.canEdit(enactor, target);
      return `${target.data.name}${edit ? "(" + target._id + ")" : ""}`;
    }

    async dig({ enDbref = "", name, toExit = "", fromExit = "" }) {
      // First. create the room
      const results = [];
      const room = await entity(name, "room");
      results.push(
        `Room ${await this.name(enDbref, room._id).catch((err) =>
          console.log(err)
        )} dug.`
      );

      // If ther's a to exit defined, create the exit and link it.
      if (toExit) {
        const leaving = await entity("exit");
        leaving.data.name = toExit;
        leaving.data.destination = room._id;
        room.exits.push(leaving._id);
        await mu.db.update(leaving._id, leaving);
        await mu.db.update(room._id, room);
        results.push(
          `exit ${this.name(
            enDbref,
            leaving._ud
          )} opened and linked to ${this.name(enDbref, room._id)}.`
        );

        // See if a returning exit was defined.
        if (fromExit) {
          const en = await mu.db.get(enDbref);
          const curRoom = await mu.db.get(en.location);
          const returning = entity("exit");
          returning.name = fromExit;
          returning.destination = en.location;
          currRoom.data.exits.push(returning._id);
          await mu.db.update(returning._id, returning);
          await mu.db.update(curRoom._id, curRoom);
          results.push(
            `exit ${this.name(
              enDbref,
              returning._ud
            )} opened and linked to ${this.name(enDbref, currRoom._id)}.`
          );
        }
      }
      return results.join("\n");
    }
  }

  return new Gr1d();
};
