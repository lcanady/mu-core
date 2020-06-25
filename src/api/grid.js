const { db } = require("./database");

module.exports = (mu) => {
  /**
   * Create a base database entity.
   * @param {string} enDbref
   * @param {string} name
   */
  const baseObj = async (name) =>
    await mu.db.create({
      _id: `#${await mu.db.count()}`,
      data: { name },
    });

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
        await mu.flags.setFlags(obj, "object exit");
        break;
      default:
        throw new Error("Unknown Object Type");
    }
    return obj;
  };

  class Gr1d {
    name(en, tar) {
      if (en === "") en = tar;
      const edit = mu.flags.canEdit(en, tar);
      return `${tar.data.name}${
        edit ? "(" + tar._id + mu.flags.code(tar.data.flags) + ")" : ""
      }`;
    }

    /**
     * Create a new Database Object
     * @param {Object} loc The own
     * @param {string} name The name of the object to be  created.
     * @param {string} type The type of object to make.
     */
    async create(name, loc, type = "thing") {
      const thing = await entity(name, type);
      thing.data.owner = loc._id;
      thing.data.location = loc._id;
      loc.data.contents.push(thing._id);
      await mu.db.update(loc._id, loc);
      return await mu.db.update(thing._id, thing);
    }

    /**
     * Dig a new room.
     * @param {Object} options Settings to be passed to setup a new room.
     * @param {string} options.enDbref The dbref of the enactor.
     * @param {string} options.name The name of the new room.
     * @param {string} [options.toExit=] The exit to the new room.
     * @param {string} [options.fromExit=] The exit back to the users
     * current room.
     */
    async dig({ enDbref = "", name, toExit = "", fromExit = "" }) {
      // First. create the room
      const results = [];
      const room = await entity(name, "room");
      room.data.owner = room._id;
      await mu.db.update(room._id, room);

      results.push(`Room ${this.name(enDbref, room)} dug.`);

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

    /**
     * Test if one object can 'see' another.
     * @param {Object} en The looker
     * @param {Object} tar The lookee
     */
    canSee(en, tar) {
      // If it's a user and they're connected
      if (
        mu.flags.hasFlags(tar, "connected !dark") ||
        (mu.flags.hasFlags(en, "wizard+") &&
          mu.flags.hasFlags(tar, "connected dark"))
      ) {
        // if the user is dark, but can be edited by the enactor
        // make it visible to the enactor.
        return true;
      } else if (
        mu.flags.hasFlags(tar, "!user !player !exit !dark") ||
        (mu.flags.hasFlags(en, "wizard+") &&
          mu.flags.hasFlags(tar, "!user !player !exit dark"))
      ) {
        // Else if it's an object that's not dark (or you're a wizard+!)
        return true;
      } else {
        return false;
      }
    }

    async target(en, tar) {
      // Evaluate to figure out the value of `tar`.
      tar = tar.trim();
      if (tar) {
        switch (tar.toLowerCase()) {
          case "here":
            tar = await mu.db.get(en.data.location);
            break;
          case "me":
            tar = en;
            break;
          default:
            const results = await mu.db.find({
              $where: function () {
                return this.data.name.toLowerCase() === tar.toLowerCase();
              },
            });
            if (results.length === 1) {
              tar = results[0];
            } else if (results.length > 1) {
              throw new Error("I don't know which one you mean.");
            } else {
              throw new Error("I can't find that.");
            }
        }
      } else {
        tar = await mu.db.get(en?.data?.location);
      }
      return tar;
    }
  }

  return new Gr1d();
};
