const db = require("../db/db");

const Record = {
  create: (recordname, artid, image, releaseDate, genre, language) => {
    return new Promise((resolve, reject) => {
      const query = `INSERT INTO records (recordname, artid, image, release_date, genre, language) VALUES (?, ?, ?, ?, ?, ?)`;
      db.run(query, [recordname, artid, image, releaseDate, genre, language], function (err) {
        if (err) reject(err);
        else resolve({ id: this.lastID, recordname, artid, image, release_date: releaseDate, genre, language });
      });
    });
  },

  findByRecordname: (recordname) => {
    return new Promise((resolve, reject) => {
      const query = `SELECT * FROM records WHERE recordname = ?`;
      db.all(query, [recordname], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
  },

  findByArtid: (artid) => {
    return new Promise((resolve, reject) => {
      const query = `SELECT * FROM records WHERE artid = ?`;
      db.all(query, [artid], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
  },

  findById: (Id) => {
    return new Promise((resolve, reject) => {
      const query = `SELECT * FROM records WHERE id = ?`;
      db.get(query, [Id], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
  },

  // Cerca gli album il cui nome contiene il testo
  search: (text) => {
    return new Promise((resolve, reject) => {
      const query = `SELECT records.*, artists.artname
                     FROM records
                     JOIN artists ON records.artid = artists.id
                     WHERE records.recordname LIKE ?`;
      db.all(query, ["%" + text + "%"], (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  }
};

module.exports = Record;