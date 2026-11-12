  const db = require("../db/db");

const Artist = {
  create: (artname, image, birthDate, country, bio) => {
    return new Promise((resolve, reject) => {
      const query = `INSERT INTO artists (artname, image, birth_date, country, bio) VALUES (?, ?, ?, ?, ?)`;
      db.run(query, [artname, image, birthDate, country, bio], function (err) {
        if (err) reject(err);
        else resolve({ id: this.lastID, artname, image, birth_date: birthDate, country, bio });
      });
    });
  },

  update: (id, image, birthDate, country, bio) => {
    return new Promise((resolve, reject) => {
      const query = `UPDATE artists SET image = ?, birth_date = ?, country = ?, bio = ? WHERE id = ?`;
      db.run(query, [image, birthDate, country, bio, id], function (err) {
        if (err) reject(err);
        else resolve({ id, image, birth_date: birthDate, country, bio });
      });
    });
  },

  correct: (id, artname, image, birthDate, country, bio) => {
    return new Promise((resolve, reject) => {
      const query = `UPDATE artists SET artname = ?, image = ?, birth_date = ?, country = ?, bio = ? WHERE id = ?`;
      db.run(query, [artname, image, birthDate, country, bio, id], function (err) {
        if (err) reject(err);
        else resolve({ id, artname, image, birth_date: birthDate, country, bio });
      });
    });
  },

  findByArtname: (artname) => {
    return new Promise((resolve, reject) => {
      const query = `SELECT * FROM artists WHERE artname = ?`;
      db.all(query, [artname], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
  },

  getOnThisDay: (day, minFavourites) => {
    return new Promise((resolve, reject) => {
      const query = `SELECT artists.id, artists.artname, artists.image, artists.birth_date, COUNT(favourite_artists.username) AS followers
                     FROM artists
                     JOIN favourite_artists ON favourite_artists.artist_id = artists.id
                     WHERE strftime('%m-%d', artists.birth_date) = COALESCE(?, strftime('%m-%d', 'now', 'localtime'))
                     GROUP BY artists.id
                     HAVING COUNT(favourite_artists.username) >= ?
                     ORDER BY followers DESC`;
      db.all(query, [day, minFavourites], (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  },

  findById: (id) => {
    return new Promise((resolve, reject) => {
      const query = `SELECT artists.*, (SELECT COUNT(*) FROM favourite_artists WHERE artist_id = artists.id) AS followers
                     FROM artists WHERE id = ?`;
      db.get(query, [id], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
  },

  search: (text) => {
    return new Promise((resolve, reject) => {
      const query = `SELECT * FROM artists WHERE artname LIKE ?
                     ORDER BY CASE WHEN artname LIKE ? THEN 0 ELSE 1 END, artname`;
      db.all(query, ["%" + text + "%", text + "%"], (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  },

  findGenres: (id) => {
    return new Promise((resolve, reject) => {
      const query = `SELECT DISTINCT genres.id, genres.name
                     FROM records
                     JOIN record_genres ON record_genres.record_id = records.id
                     JOIN genres ON genres.id = record_genres.genre_id
                     WHERE records.artid = ?
                     ORDER BY genres.name`;
      db.all(query, [id], (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  },

  findDiscography: (id) => {
    return new Promise((resolve, reject) => {
      const query = `SELECT records.id, records.recordname, records.image, records.release_date,
                       COALESCE((SELECT ROUND(AVG(rating), 2) FROM record_ratings WHERE record_id = records.id), 0) AS average,
                       (SELECT COUNT(*) FROM record_ratings WHERE record_id = records.id) AS count
                     FROM records
                     WHERE records.artid = ?
                     ORDER BY records.release_date IS NULL, records.release_date`;
      db.all(query, [id], (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  },

  findTopSongs: (id, limit, offset) => {
    return new Promise((resolve, reject) => {
      const query = `SELECT songs.*, records.recordname, records.image AS recordimage
                     FROM songs
                     JOIN records ON records.id = songs.recordid
                     WHERE records.artid = ?
                     ORDER BY songs.rating DESC, songs.songname
                     LIMIT ? OFFSET ?`;
      db.all(query, [id, limit, offset], (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  },

  countSongs: (id) => {
    return new Promise((resolve, reject) => {
      const query = `SELECT COUNT(*) AS total FROM songs JOIN records ON records.id = songs.recordid WHERE records.artid = ?`;
      db.get(query, [id], (err, row) => {
        if (err) reject(err);
        else resolve(row.total);
      });
    });
  }
};

module.exports = Artist;
