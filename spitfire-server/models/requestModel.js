const db = require("../db/db");

const Request = {
  create: (username, type, targetId, data) => {
    return new Promise((resolve, reject) => {
      const query = `INSERT INTO requests (username, type, target_id, name, artist_name, album_name, release_date, genres, language,
                       lyrics, birth_date, country, bio, tracklist, duration, image, source)
                     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
      const params = [username, type, targetId, data.name, data.artistName, data.albumName, data.releaseDate, data.genres, data.language,
                      data.lyrics, data.birthDate, data.country, data.bio, data.tracklist, data.duration, data.image, data.source || null];
      db.run(query, params, function (err) {
        if (err) reject(err);
        else resolve({ id: this.lastID, username, type, target_id: targetId, status: "pending", ...data });
      });
    });
  },

  findById: (id) => {
    return new Promise((resolve, reject) => {
      const query = `SELECT * FROM requests WHERE id = ?`;
      db.get(query, [id], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
  },

  findPending: () => {
    return new Promise((resolve, reject) => {
      const query = `SELECT requests.*, users.foto_profilo,
                       CASE requests.type
                         WHEN 'song' THEN (SELECT songname FROM songs WHERE songs.id = requests.target_id)
                         WHEN 'translation' THEN (SELECT songname FROM songs WHERE songs.id = requests.target_id)
                         WHEN 'record' THEN (SELECT recordname FROM records WHERE records.id = requests.target_id)
                         WHEN 'artist' THEN (SELECT artname FROM artists WHERE artists.id = requests.target_id)
                       END AS target_name
                     FROM requests
                     LEFT JOIN users ON users.username = requests.username
                     WHERE requests.status = 'pending'
                     ORDER BY requests.id ASC`;
      db.all(query, [], (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  },

  setStatus: (id, status) => {
    return new Promise((resolve, reject) => {
      const query = `UPDATE requests SET status = ? WHERE id = ?`;
      db.run(query, [status, id], function (err) {
        if (err) reject(err);
        else resolve({ id, status });
      });
    });
  },

  findByUsername: (username) => {
    return new Promise((resolve, reject) => {
      const query = `SELECT * FROM requests WHERE username = ? ORDER BY id DESC`;
      db.all(query, [username], (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  }
};

module.exports = Request;
