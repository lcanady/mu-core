const { db } = require("./database");
const { readFileSync } = require("fs");
const yml = require("yaml");
const { resolve } = require("path");
const { cpuUsage } = require("process");

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
  flag({ name, code = "", lvl = 0, lock = "", components = "" }) {
    if (this.flags.indexOf(name.toLowerCase()) === -1) {
      this.flags.push({
        name,
        code,
        lvl,
        lock,
        components,
      });
    }
  }

  code(flags) {
    const results = [];
    for (const flag of flags) {
      results.push(this.flags.find((flg) => flg.name === flag));
    }

    return results.map((flag) => flag.code).join("");
  }

  isFlag(flag) {
    return this.flags.filter((flg) => flg.name === flag.toLowerCase())[0];
  }

  /**
   * Search an object for certain flags.
   * @param {Object} obj The object to check.
   * @param {string} flags The flag list to check against.
   */
  hasFlags(obj, flags) {
    const flgs = flags.split(" ");
    const results = [];

    for (const flag of flgs) {
      // If the flag starts with a bang, then we need to make sure the
      // data object DOESN'T have the flag.
      const combined = flag.match(/.*\|.*/);
      if (combined && combined.length > 0) {
        const tmpRes = [];
        const fls = flag.split("|");
        for (const f of fls) {
          if (f.startsWith("!")) {
            tmpRes.push(
              obj.flags.indexOf(f.slice(1).toLowerCase()) < 0 ||
                obj.data === undefined
                ? true
                : false
            );
          } else if (f.endsWith("+")) {
            const ed = f.slice(0, f.length - 1);
            const rec = this.flags.find((flg) => flg.name === ed);
            if (rec) {
              tmpRes.push(rec.lvl >= this.bitLvl(obj) ? true : false);
            } else {
              tmpRes.push(false);
            }
          } else {
            // Else check for the flag per normal.
            tmpRes.push(obj.flags.indexOf(f.toLowerCase()) > -1 ? true : false);
          }
        }
        results.push(tmpRes.indexOf(true) >= 0 ? true : false);
      } else if (flag.startsWith("!")) {
        results.push(
          obj?.flags?.indexOf(flag.slice(1).toLowerCase()) < 0 ||
            obj.data === undefined
            ? true
            : false
        );
      } else if (flag.endsWith("+")) {
        const rec = this.flags.find(
          (flg) => flg.name === flag.slice(0, flag.length - 1)
        );
        if (rec) {
          results.push(rec.lvl <= this.bitLvl(obj) ? true : false);
        } else {
          results.push(false);
        }
      } else {
        // Else check for the flag per normal.
        results.push(obj.flags.indexOf(flag.toLowerCase()) > -1 ? true : false);
      }
    }

    // Finally, make sure there's no false entries in the results.
    return results.indexOf(false) === -1;
  }

  /**
   * Check the bitlevel of an object.
   * @param {Object} Obj The user object to check the bit level for.
   */
  bitLvl(obj) {
    return obj.flags.reduce((acc, cur) => {
      const flg = this.flags.find((flag) => flag.name === cur.toLowerCase());
      const value = (acc += flg.lvl || 0);
      return value;
    }, 0);
  }

  /**
   * Check to see if one object has the bit level or onwership
   * permissions to affect another object.
   * @param {Object} obj1
   * @param {Object} obj2
   */
  canEdit(obj1, obj2) {
    return this.bitLvl(obj1) > this.bitLvl(obj2) ||
      obj2.data?.owner === obj1._id
      ? true
      : false;
  }

  /**
   * Set flags on obj2 checking obj1 for permissions.
   * @param {Object} obj The target Object
   * @param {string} flags The flag string to check against.
   */
  async setFlags(obj, flags = "") {
    // Split the flag string into an array
    flags = flags.split(" ");
    // Go through the list of flags and Set them (if possible).
    const results = [];
    for (let flag of flags) {
      // Create a set to filter for flags the obj might already have.
      const flagSet = new Set(obj.flags);
      if (!flag.startsWith("!")) {
        flagSet.add(this.isFlag(flag).name.toLowerCase());
      } else {
        flagSet.delete(this.isFlag(flag.slice(1)).name.toLowerCase());
      }

      obj.flags = Array.from(flagSet);

      if (!flag.startsWith("!")) {
        obj.data = { ...this.isFlag(flag).components, ...obj.data };
      } else {
        const flg = flag.slice(1);
        for (const comp in this.isFlag(flg)?.components) {
          delete obj.data[comp];
        }
      }

      // Update the db object.
      await db
        .update(obj._id, obj)
        .catch(() => results.push("#-1 Server Error"));

      // Add to the results object
      results.push(
        `Done. Flag %ch${this.isFlag(
          flag.startsWith("!") ? flag.slice(1) : flag
        ).name.toLowerCase()}%cn ${
          flag.startsWith("!") ? "removed from" : "set on"
        } %ch${obj.data.name}%cn.`
      );
    }
    return results;
  }
}

module.exports = new Flags();
