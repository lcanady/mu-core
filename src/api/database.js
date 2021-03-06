const DataStore = require("nedb");
const { resolve } = require("path");

class Database {
  constructor(name) {
    this._db = new DataStore({
      filename: resolve(__dirname, "../../data/" + name),
      autoload: true,
    });
  }

  create(data) {
    return new Promise((resolve, reject) =>
      this._db.insert(data, (err, doc) => {
        if (err) reject(err);
        resolve(doc);
      })
    );
  }

  get(id) {
    return new Promise((resolve, reject) =>
      this._db.findOne(
        {
          $where: function () {
            return this._id === id;
          },
        },
        (err, doc) => {
          if (err) reject(err);
          resolve(doc);
        }
      )
    );
  }

  find(query) {
    return new Promise((resolve, reject) =>
      this._db.find(query, (err, docs) => {
        if (err) reject(err);
        resolve(docs);
      })
    );
  }

  /**
   * Update a record in the database.
   * @param {string} id The id of the db entry.
   * @param {Object} data The data to update the db entry with
   */
  async update(id, data) {
    return new Promise((resolve, reject) =>
      this._db.update(
        {
          $where: function () {
            return this._id === id;
          },
        },
        data,
        { returnUpdatedDocs: true },
        (err, num, docs) => {
          if (err) reject(err);
          resolve(docs);
        }
      )
    );
  }

  remove(id) {
    return new Promise((resolve, reject) =>
      this._db.remove(
        {
          $where: function () {
            return this._id === id;
          },
        },
        (err, num) => {
          if (err) reject(err);
          resolve(num);
        }
      )
    );
  }

  /**
   * Count the records in the database.
   */
  count() {
    return new Promise((resolve, reject) =>
      this._db.count({}, (err, num) => {
        if (err) reject(err);
        resolve(num);
      })
    );
  }
}

module.exports.channels = new Database("channels.db");
module.exports.db = new Database("mu.db");
