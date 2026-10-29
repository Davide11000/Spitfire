const db = require("../db/db");

const Genre = {

  findAll: () => {
    return new Promise((resolve, reject) => {
      const query = `SELECT * FROM genres ORDER BY name`;
      db.all(query, [], (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  },

  findById: (id) => {
    return new Promise((resolve, reject) => {
      const query = `SELECT * FROM genres WHERE id = ?`;
      db.get(query, [id], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
  },

  // ALBUM

  // Generi di un album
  findByRecord: (recordId) => {
    return new Promise((resolve, reject) => {
      const query = `SELECT genres.*
                     FROM record_genres
                     JOIN genres ON record_genres.genre_id = genres.id
                     WHERE record_genres.record_id = ?`;
      db.all(query, [recordId], (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  },

  // Album di un genere
  findRecords: (genreId) => {
    return new Promise((resolve, reject) => {
      const query = `SELECT records.*, artists.artname
                     FROM record_genres
                     JOIN records ON record_genres.record_id = records.id
                     JOIN artists ON records.artid = artists.id
                     WHERE record_genres.genre_id = ?`;
      db.all(query, [genreId], (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  },

  addToRecord: (recordId, genreId) => {
    return new Promise((resolve, reject) => {
      const query = `INSERT INTO record_genres (record_id, genre_id) VALUES (?, ?)`;
      db.run(query, [recordId, genreId], function (err) {
        if (err) reject(err);
        else resolve({ recordId, genreId });
      });
    });
  },

  removeFromRecord: (recordId, genreId) => {
    return new Promise((resolve, reject) => {
      const query = `DELETE FROM record_genres WHERE record_id = ? AND genre_id = ?`;
      db.run(query, [recordId, genreId], function (err) {
        if (err) reject(err);
        else resolve({ recordId, genreId });
      });
    });
  },

  // CANZONI

  // Generi di una canzone
  findBySong: (songId) => {
    return new Promise((resolve, reject) => {
      const query = `SELECT genres.*
                     FROM song_genres
                     JOIN genres ON song_genres.genre_id = genres.id
                     WHERE song_genres.song_id = ?`;
      db.all(query, [songId], (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  },

  // Canzoni di un genere
  findSongs: (genreId) => {
    return new Promise((resolve, reject) => {
      const query = `SELECT songs.id, songs.songname, songs.recordid, songs.image, artists.artname, records.image AS recordimage
                     FROM song_genres
                     JOIN songs ON song_genres.song_id = songs.id
                     JOIN records ON songs.recordid = records.id
                     JOIN artists ON records.artid = artists.id
                     WHERE song_genres.genre_id = ?`;
      db.all(query, [genreId], (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  },

  addToSong: (songId, genreId) => {
    return new Promise((resolve, reject) => {
      const query = `INSERT INTO song_genres (song_id, genre_id) VALUES (?, ?)`;
      db.run(query, [songId, genreId], function (err) {
        if (err) reject(err);
        else resolve({ songId, genreId });
      });
    });
  },

  removeFromSong: (songId, genreId) => {
    return new Promise((resolve, reject) => {
      const query = `DELETE FROM song_genres WHERE song_id = ? AND genre_id = ?`;
      db.run(query, [songId, genreId], function (err) {
        if (err) reject(err);
        else resolve({ songId, genreId });
      });
    });
  }
};

module.exports = Genre;
