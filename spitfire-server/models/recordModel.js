const db = require("../db/db");

const Record = {
  create: (recordname, artid, id) => {
    return new Promise((resolve, reject) => {
      const query = `INSERT INTO artists (recordname, artid) VALUES (?, ?)`;
      db.run(query, [recordname, artid], function (err) {
        if (err) reject(err);
        else resolve({ recordname, artid });
      });
    });
  },

  findByRecordname: (recordname) => {
    return new Promise((resolve, reject) => {
      const query = `SELECT * FROM artists WHERE recordname = ?`;
      db.all(query, [recordname], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
  },

  findByArtid: (artid) => {
    return new Promise((resolve, reject) => {
      const query = `SELECT * FROM artists WHERE artid = ?`;
      db.all(query, [artid], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
  },

  findById: (Id) => {
    return new Promise((resolve, reject) => {
      const query = `SELECT * FROM artists WHERE id = ?`;
      db.get(query, [Id], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
  }
};

module.exports = Record;