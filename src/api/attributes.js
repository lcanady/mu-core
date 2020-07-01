module.exports = (mu) => {
  class Attributes {
    /**
     * Create or update an attribute on a database object.
     * @param {Object} obj The object ot add the attribute too.
     * @param {string} name The name of the attribute to set.
     * @param {string} value  The string value to set the attribute too.
     */
    async set({ en, tar, name, value }) {
      // If the object  actually has the object flag (needed to have
      // attributes).
      if (tar.flags.indexOf("object") >= 0) {
        // If there's a value update the attribute, else remove it from
        // the registry.
        if (value) {
          tar.data.attributes[name] = {};
          tar.data.attributes[name].value = value;
          tar.data.attributes[name].setBy = en._id;
          tar.data.attributes[name].data = Date.now();
        } else {
          delete tar.data.attributes[name];
        }

        // Update the object's db record!
        await mu.db.update(tar._id, tar);

        return `%chDone%cn. Attribute (%ch${name.toLowerCase()}%cn) ${
          value ? "set on" : "removed from"
        } ${tar.data.moniker || "%ch" + tar.data.name + "%cn"}.`;
      } else {
        return "That's not an object.";
      }
    }

    /**
     * Get the value of an attribute
     * @param {*} obj1 The enacting object
     * @param {*} tar The target
     * @param {string} name The name of the attribute to get.
     */
    get(obj1, obj2, name) {
      if (mu.flags.canEdit(obj1, obj2)) {
        // If obj is an actual in-game object
        if (obj2.flags.indexOf("object") >= 0) {
          // If Obj2 actually has the attribute, return the value.
          if (obj2.data.attributes.hasOwnProperty(name.toLowerCase())) {
            return obj2.data.attributes[name.toLowerCase()];
          }
        } else {
          return "That's not an object.";
        }
      } else {
        return "Permission denied.";
      }
    }
  }

  return new Attributes();
};
