const db = require("../db/db");

const Song = {
  create: (songname, recordid) => {
    return new Promise((resolve, reject) => {
      const query = `INSERT INTO songs (songname, recordid) VALUES (?, ?)`;
      db.run(query, [songname, recordid], function (err) {
        if (err) reject(err);
        else resolve({ id:this.lastID, songname, recordid });
      });
    });
  },

  findBysongname: (songname) => {
    return new Promise((resolve, reject) => {
      const query = `SELECT * FROM songs WHERE songname = ?`;
      db.all(query, [songname], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
  },

  findByrecordid: (recordid) => {
    return new Promise((resolve, reject) => {
      const query = `SELECT * FROM songs WHERE recordid = ?`;
      db.all(query, [recordid], (err, row) => {
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