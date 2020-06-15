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

  update(id, data) {
    return new Promise((resolve, reject) =>
      this._db.update(
        {
          $where: function () {
            return this._id === id;
          },
        },
        data,
        { returnUpdatedDocs: true },
        (err, docs) => {
          if (err) reject(err), resolve(docs);
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
}

module.exports.flags = new Database("flags.db");
module.exports.db = new Database("mu.db");
