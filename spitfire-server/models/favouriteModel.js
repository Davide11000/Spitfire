const db = require("../db/db");

const Favourite = {

  // ARTISTI

  addArtist: (username, artistId) => {
    return new Promise((resolve, reject) => {
      const query = `INSERT INTO favourite_artists (username, artist_id) VALUES (?, ?)`;
      db.run(query, [username, artistId], function (err) {
        if (err) reject(err);
        else resolve({ username, artistId });
      });
    });
  },

  removeArtist: (username, artistId) => {
    return new Promise((resolve, reject) => {
      const query = `DELETE FROM favourite_artists WHERE username = ? AND artist_id = ?`;
      db.run(query, [username, artistId], function (err) {
        if (err) reject(err);
        else resolve({ username, artistId });
      });
    });
  },

  findArtists: (username) => {
    return new Promise((resolve, reject) => {
      const query = `SELECT artists.*
                     FROM favourite_artists
                     JOIN artists ON favourite_artists.artist_id = artists.id
                     WHERE favourite_artists.username = ?`;
      db.all(query, [username], (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  },

  // ALBUM

  addRecord: (username, recordId) => {
    return new Promise((resolve, reject) => {
      const query = `INSERT INTO favourite_records (username, record_id) VALUES (?, ?)`;
      db.run(query, [username, recordId], function (err) {
        if (err) reject(err);
        else resolve({ username, recordId });
      });
    });
  },

  removeRecord: (username, recordId) => {
    return new Promise((resolve, reject) => {
      const query = `DELETE FROM favourite_records WHERE username = ? AND record_id = ?`;
      db.run(query, [username, recordId], function (err) {
        if (err) reject(err);
        else resolve({ username, recordId });
      });
    });
  },

  findRecords: (username) => {
    return new Promise((resolve, reject) => {
      const query = `SELECT records.*, artists.artname
                     FROM favourite_records
                     JOIN records ON favourite_records.record_id = records.id
                     JOIN artists ON records.artid = artists.id
                     WHERE favourite_records.username = ?`;
      db.all(query, [username], (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  },

  // CANZONI

  addSong: (username, songId) => {
    return new Promise((resolve, reject) => {
      const query = `INSERT INTO favourite_songs (username, song_id) VALUES (?, ?)`;
      db.run(query, [username, songId], function (err) {
        if (err) reject(err);
        else resolve({ username, songId });
      });
    });
  },

  removeSong: (username, songId) => {
    return new Promise((resolve, reject) => {
      const query = `DELETE FROM favourite_songs WHERE username = ? AND song_id = ?`;
      db.run(query, [username, songId], function (err) {
        if (err) reject(err);
        else resolve({ username, songId });
      });
    });
  },

  findSongs: (username) => {
    return new Promise((resolve, reject) => {
      const query = `SELECT songs.id, songs.songname, songs.recordid, songs.image, artists.artname, records.image AS recordimage
                     FROM favourite_songs
                     JOIN songs ON favourite_songs.song_id = songs.id
                     JOIN records ON songs.recordid = records.id
                     JOIN artists ON records.artid = artists.id
                     WHERE favourite_songs.username = ?`;
      db.all(query, [username], (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  }
};

module.exports = Favourite;
