const { db } = require("./database");
const { readFileSync } = require("fs");
const yml = require("yaml");
const { resolve } = require("path");

class Flags {
  constructor() {
    this.flags = [];
    let flgs = readFileSync(resolve(__dirname, "../../config/flags.yml"), {
      encoding: "utf-8",
    });
    flgs = yml.parse(flgs);
    flgs.flags.forEach((flag) => this.flags.push(flag));
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
  async hasFlags(obj, flags) {
    let en;
    const flgs = flags.split(" ");
    if (obj._id) {
      en = await db.get(obj._id);
    }
    const results = [];
    flgs.forEach((flag) => {
      // If the flag starts with a bang, then we need to make sure the
      // data object DOESN'T have the flag.
      if (flag.startsWith("!")) {
        results.push(
          en?.data?.flags.indexOf(flag.slice(1).toLowerCase()) < 0 ||
            en === undefined
            ? true
            : false
        );
      } else {
        // Else check for the flag per normal.
        results.push(en?.data?.flags.indexOf(flag.toLowerCase()) ?? false);
      }
    });

    // Finally, make sure there's no false entries in the results.
    return results.indexOf(false) === -1;
  }

  /**
   * Check the bitlevel of an object.
   * @param {Object} Obj The user object to check the bit level for.
   */
  async bitLvl(obj) {
    let en;
    if (obj._id) {
      en = await db.get(obj._id);
    }

    if (en?.data?.flags) {
      return en.data.flags.reduce((acc, cur) => (acc += cur.lvl), 0);
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
  async canEdit(obj1, obj2) {
    let en, tar;
    if (obj1._id) {
      en = await db.get(obj1._id);
    }

    if (obj2._id) {
      tar = await db.get(obj2._id);
    }

    return this.bitLvl(en) > this.bitLvl(tar) || tar?.owner === en?.data._id
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
    let en, tar;
    if (obj1._id) {
      en = await db.get(obj1._id);
    }

    if (obj2._id) {
      tar = await db.get(obj2._id);
    }

    if (this.canEdit(en, tar)) {
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
          if (this.hasFlags(en, this.flags[idx].lock)) {
            // Create a set to filter for flags the obj might already have.
            const flagSet = new Set(en?.data?.flags);
            if (!flag.startsWith("!")) {
              flagSet.add(this.flags[idx].name.toLowerCase());
            } else {
              flagSet.delete(this.flags[idx].name.slice(1).toLowerCase());
            }

            tar.data.flags = Array.from(flagSet);

            if (!flag.startsWith("!")) {
              // Add any included components to the data property of obj2.
              tar.data = { ...tar.data, ...this.flags[idx]?.components };
            } else {
              // Else remove all components associated with the flag from obj2.
              for (const comp of this.flags[idx]?.components) {
                delete tar.data.components[comp];
              }
            }

            // Update the db object.
            await db
              .update(tar._id, tar)
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
