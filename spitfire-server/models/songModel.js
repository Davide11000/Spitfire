const db = require("../db/db");

const Song = {
  create: (songname, recordid, artid, image, language, lyrics) => {
    return new Promise((resolve, reject) => {
      const query = `INSERT INTO songs (songname, recordid, artid, image, language, lyrics) VALUES (?, ?, ?, ?, ?, ?)`;
      db.run(query, [songname, recordid, artid, image, language, lyrics], function (err) {
        if (err) reject(err);
        else resolve({ id:this.lastID, songname, recordid, artid, image, language, lyrics });
      });
    });
  },

  update: (id, image, language, lyrics) => {
    return new Promise((resolve, reject) => {
      const query = `UPDATE songs SET image = ?, language = ?, lyrics = ? WHERE id = ?`;
      db.run(query, [image, language, lyrics, id], function (err) {
        if (err) reject(err);
        else resolve({ id, image, language, lyrics });
      });
    });
  },

  correct: (id, songname, image, language, lyrics, duration) => {
    return new Promise((resolve, reject) => {
      const query = `UPDATE songs SET songname = ?, image = ?, language = ?, lyrics = ?, duration = ? WHERE id = ?`;
      db.run(query, [songname, image, language, lyrics, duration, id], function (err) {
        if (err) reject(err);
        else resolve({ id, songname, image, language, lyrics, duration });
      });
    });
  },

  setDuration: (id, duration) => {
    return new Promise((resolve, reject) => {
      const query = `UPDATE songs SET duration = ? WHERE id = ?`;
      db.run(query, [duration, id], function (err) {
        if (err) reject(err);
        else resolve({ id, duration });
      });
    });
  },

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

  findDetails: (id) => {
    return new Promise((resolve, reject) => {
      const query = `SELECT songs.*, records.recordname, records.image AS recordimage,
                       artists.id AS artist_id, artists.artname
                     FROM songs
                     LEFT JOIN records ON records.id = songs.recordid
                     LEFT JOIN artists ON artists.id = records.artid
                     WHERE songs.id = ?`;
      db.get(query, [id], (err, row) => {
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