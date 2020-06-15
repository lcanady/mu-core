const { db } = require("./database");

class Flags {
  constructor() {
    this.flags = [];
  }

  /**
   * @typedef {object} Flag
   * @property {string} name The name of the flag
   * @property {string} [code] The short-code for the flag
   * @property {number} [lvl] The 'bit level' of the flag.
   * @property {string} [lock] The flags required to set the flag
   * @property {{}} [components] Any components to be added or
   * removed from an object when the flag status is changed.
   */

  /**
   * Register a new flag with the MU.
   * @param {Flag} params
   */
  flag({ name, code, lvl, lock, components }) {
    if (this.flags.indexOf(name.toLowerCase()) === -1) {
      this.flags.push({
        name,
        code: code || "",
        lvl: lvl || 0,
        lock: lock || "",
        components,
      });
    }
  }

  /**
   * Search an object for certain flags.
   * @param {Object} obj The object to check.
   * @param {string} flags The flag list to check against.
   */
  hasFlags(obj, flags) {
    // If the user is logged into a character continue.
    // Else return false.

    const flgs = flags.split(" ");
    const results = [];
    flgs.forEach((flag) => {
      // If the flag starts with a bang, then we need to make sure the
      // data object DOESN'T have the flag.
      if (flag.startsWith("!")) {
        results.push(
          obj?.data?.flags.indexOf(flag.slice(1).toLowerCase()) === -1 ||
            !obj?.data?.flags
        );
      } else if (flag.endsWith("+")) {
      } else {
        // Else check for the flag per normal.
        results.push(obj?.data?.flags.indexOf(flag.toLowerCase()) !== -1);
      }
    });

    // Finally, make sure there's no false entries in the results.
    return results.indexOf(false) === -1;
  }

  /**
   * Check the bitlevel of an object.
   * @param {Object} Obj The user object to check the bit level for.
   */
  bitLvl(obj) {
    if (obj?.data?.flags) {
      return obj.data.flags.reduce((acc, cur) => (acc += cur.lvl), 0);
    } else {
      return -1;
    }
  }

  /**
   * Check to see if one object has the bit level or onwership
   * permissions to affect another object.
   * @param {Object} obj1
   * @param {Object} obj2
   */
  canEdit(obj1, obj2) {
    return this.bitLvl(obj1) > this.bitLvl(obj2) ||
      obj2?.owner === obj1?.data._id
      ? true
      : false;
  }

  /**
   * Set flags on obj2 checking obj1 for permissions.
   * @param {Object} obj1
   * @param {Object} obj2
   * @param {string} flags The flag string to check against.
   */
  async setFlags(obj1, obj2, flags) {
    if (this.canEdit(obj1, obj2)) {
      // Split the flag string into an array
      flags = flags.split(" ");
      // Go through the list of flags and Set them (if possible).
      const results = [];
      for (flag of flags) {
        if (!flag.startsWith("!")) {
          const idx = this.flags.indexOf(flag.toLowerCase());
        } else {
          const idx = this.flags.indexOf(flag.slice(1).toLowerCase());
        }

        if (idx !== -1) {
          // Next check to see if obj1 has the permissions to set the flag.
          if (this.hasFlags(obj1, this.flags[idx].lock)) {
            // Create a set to filter for flags the obj might already have.
            const flagSet = new Set(obj2.data?.flags);
            if (!flag.startsWith("!")) {
              flagSet.add(this.flags[idx].name.toLowerCase());
            } else {
              flagSet.delete(this.flags[idx].name.slice(1).toLowerCase());
            }

            obj2.data.flags = Array.from(flagSet);

            if (!flag.startsWith("!")) {
              // Add any included components to the data property of obj2.
              obj2.data = { ...obj2.data, ...this.flags[idx]?.components };
            } else {
              // Else remove all components associated with the flag from obj2.
              for (const comp of this.flags[idx]?.components) {
                delete obj2.data.components[comp];
              }
            }

            // Update the db object.
            await db
              .update(obj2._id, obj2)
              .catch((err) => results.push("Permission denied."));

            // Add to the results object
            results.push(
              `Done. Flag (${this.flags[idx].name.toLowerCase()}) ${
                flag.startsWith("!") ? "removed" : "set"
              }`
            );
          } else {
            results.push("Permission denied.");
          }
        } else {
          results.push("Unknown flag");
        }
      }
      return results;
    }
  }
}

module.exports = new Flags();
