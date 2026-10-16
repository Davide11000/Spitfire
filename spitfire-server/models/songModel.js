const db = require("../db/db");

const Song = {
  create: (songname, recordid, image) => {
    return new Promise((resolve, reject) => {
      const query = `INSERT INTO songs (songname, recordid, image) VALUES (?, ?, ?)`;
      db.run(query, [songname, recordid, image], function (err) {
        if (err) reject(err);
        else resolve({ id:this.lastID, songname, recordid, image });
      });
    });
  },

  // Cerca le canzoni il cui nome contiene il testo
  search: (text) => {
    return new Promise((resolve, reject) => {
      const query = `SELECT songs.id, songs.songname, songs.recordid, songs.image, artists.artname, records.image AS recordimage
                     FROM songs
                     JOIN records ON songs.recordid = records.id
                     JOIN artists ON records.artid = artists.id
                     WHERE songs.songname LIKE ?`;
      db.all(query, ["%" + text + "%"], (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
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
      const query = `SELECT * FROM songs WHERE id = ?`;
      db.get(query, [id], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
  }
};

module.exports = Song;