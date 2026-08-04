const db = require("../db/db");

const Song = {
  create: (songname, recordid, id) => {
    return new Promise((resolve, reject) => {
      const query = `INSERT INTO artists (songname, recordid) VALUES (?, ?)`;
      db.run(query, [songname, recordid], function (err) {
        if (err) reject(err);
        else resolve({ songname, recordid });
      });
    });
  },

  findBysongname: (songname) => {
    return new Promise((resolve, reject) => {
      const query = `SELECT * FROM artists WHERE songname = ?`;
      db.get(query, [songname], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
  },

  findByrecordid: (recordid) => {
    return new Promise((resolve, reject) => {
      const query = `SELECT * FROM artists WHERE recordid = ?`;
      db.get(query, [recordid], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
  },

  findById: (id) => {
    return new Promise((resolve, reject) => {
      const query = `SELECT * FROM artists WHERE id = ?`;
      db.get(query, [id], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
  }
};

module.exports = Song;