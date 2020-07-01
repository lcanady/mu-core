class FileSystem {
  constructor() {
    this.system = {};
    this.cats = new Set();
    this.locks = {};
  }

  /**
   * Add a new text entry to the system.
   * @param {Object} params The object to be fed to the FileSystem object.
   * @param {string} params.name - The name of the text file to show in
   * @param {string} params.category - The category to add the text file too.
   * @param {string} params.text - The actual text of the file.
   */
  add({ name, category, text }) {
    // See if ther's a sub-catagory or not.
    let [cat = "", subCat = ""] = category.split(":");

    // If the category doesn't exist, add it to the system.
    this.cats.add(cat.toLowerCase());

    // if the category exists on the sytem object, just push a new value.
    if (this.system[cat]) {
      this.system[cat].push({
        name,
        category: cat || "general",
        subCategory: subCat,
        text,
      });
    } else {
      // Else create the category and populate it with the first entry,
      this.system[cat] = [];
      this.system[cat].push({
        name,
        category: cat || "general",
        subCategory: subCat,
        text,
      });
    }
    return this;
  }

  lock(cat, flags) {
    this.locks[cat.toLowerCase()] = flags;
    return this;
  }

  /**
   * Get an array of categories.
   */
  get categories() {
    return Array.from(this.cats);
  }

  get entries() {
    const res = [];
    // First, we need to go through each category of the system object
    for (const category in this.system) {
      this.system[category].forEach((entry) => res.push(entry.name));
    }
    return res;
  }
}

module.exports.FileSystem = FileSystem;
module.exports.help = new FileSystem();
