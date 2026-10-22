const db = require("../db/db");

const Request = {
  createSong: (username, name, artistName, albumName, releaseDate, genre, language, lyrics, image) => {
    return new Promise((resolve, reject) => {
      const query = `INSERT INTO requests (username, type, name, artist_name, album_name, release_date, genre, language, lyrics, image)
                     VALUES (?, 'song', ?, ?, ?, ?, ?, ?, ?, ?)`;
      db.run(query, [username, name, artistName, albumName, releaseDate, genre, language, lyrics, image], function (err) {
        if (err) reject(err);
        else resolve({ id: this.lastID, username, type: "song", name, artistName, albumName, releaseDate, genre, language, lyrics, image, status: "pending" });
      });
    });
  },

  createRecord: (username, name, artistName, releaseDate, genre, language, tracklist, image) => {
    return new Promise((resolve, reject) => {
      const query = `INSERT INTO requests (username, type, name, artist_name, release_date, genre, language, tracklist, image)
                     VALUES (?, 'record', ?, ?, ?, ?, ?, ?, ?)`;
      db.run(query, [username, name, artistName, releaseDate, genre, language, tracklist, image], function (err) {
        if (err) reject(err);
        else resolve({ id: this.lastID, username, type: "record", name, artistName, releaseDate, genre, language, tracklist, image, status: "pending" });
      });
    });
  },

  createArtist: (username, name, birthDate, country, bio, image) => {
    return new Promise((resolve, reject) => {
      const query = `INSERT INTO requests (username, type, name, birth_date, country, bio, image)
                     VALUES (?, 'artist', ?, ?, ?, ?, ?)`;
      db.run(query, [username, name, birthDate, country, bio, image], function (err) {
        if (err) reject(err);
        else resolve({ id: this.lastID, username, type: "artist", name, birthDate, country, bio, image, status: "pending" });
      });
    });
  },

  findByUsername: (username) => {
    return new Promise((resolve, reject) => {
      const query = `SELECT * FROM requests WHERE username = ?`;
      db.all(query, [username], (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  }
};

module.exports = Request;
