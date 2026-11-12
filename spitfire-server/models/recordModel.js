const db = require("../db/db");

const Record = {
  create: (recordname, artid, image, releaseDate, language) => {
    return new Promise((resolve, reject) => {
      const query = `INSERT INTO records (recordname, artid, image, release_date, language) VALUES (?, ?, ?, ?, ?)`;
      db.run(query, [recordname, artid, image, releaseDate, language], function (err) {
        if (err) reject(err);
        else resolve({ id: this.lastID, recordname, artid, image, release_date: releaseDate, language });
      });
    });
  },

  update: (id, image, releaseDate, language) => {
    return new Promise((resolve, reject) => {
      const query = `UPDATE records SET image = ?, release_date = ?, language = ? WHERE id = ?`;
      db.run(query, [image, releaseDate, language, id], function (err) {
        if (err) reject(err);
        else resolve({ id, image, release_date: releaseDate, language });
      });
    });
  },

  correct: (id, recordname, image, releaseDate, language) => {
    return new Promise((resolve, reject) => {
      const query = `UPDATE records SET recordname = ?, image = ?, release_date = ?, language = ? WHERE id = ?`;
      db.run(query, [recordname, image, releaseDate, language, id], function (err) {
        if (err) reject(err);
        else resolve({ id, recordname, image, release_date: releaseDate, language });
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

  findDetails: (id) => {
    return new Promise((resolve, reject) => {
      const query = `SELECT records.*, artists.artname
                     FROM records
                     LEFT JOIN artists ON artists.id = records.artid
                     WHERE records.id = ?`;
      db.get(query, [id], (err, row) => {
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

  search: (text) => {
    return new Promise((resolve, reject) => {
      const query = `SELECT records.*, artists.artname
                     FROM records
                     JOIN artists ON records.artid = artists.id
                     WHERE records.recordname LIKE ?
                     ORDER BY CASE WHEN records.recordname LIKE ? THEN 0 ELSE 1 END, records.recordname`;
      db.all(query, ["%" + text + "%", text + "%"], (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  },
  
  getOnThisDay: (day, minRatings) => {
    return new Promise((resolve, reject) => {
      const query = `SELECT records.id, records.recordname, records.image, records.release_date, records.artid, artists.artname,
                       ROUND(AVG(record_ratings.rating), 2) AS average, COUNT(record_ratings.rating) AS count
                     FROM records
                     JOIN artists ON records.artid = artists.id
                     JOIN record_ratings ON record_ratings.record_id = records.id
                     WHERE strftime('%m-%d', records.release_date) = COALESCE(?, strftime('%m-%d', 'now', 'localtime'))
                     GROUP BY records.id
                     HAVING COUNT(record_ratings.rating) >= ?
                     ORDER BY count DESC`;
      db.all(query, [day, minRatings], (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  },

  getRecent: (len) => {
    return new Promise((resolve, reject) => {
      const query = `SELECT records.*, artists.artname
                     FROM records
                     JOIN artists ON records.artid = artists.id
                     ORDER BY records.id DESC
                     LIMIT ?`;
      db.all(query, [len], (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    })
  },

  getTopRated: (len) => {
    return new Promise((resolve, reject) => {
      const query = `SELECT records.*, artists.artname
                     FROM records
                     JOIN artists ON records.artid = artists.id
                     ORDER BY records.rating DESC
                     LIMIT ?`;
      db.all(query, [len], (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    })
  },

  findByGenre: (genre) => {
    return new Promise((resolve, reject) => {
      const query = `SELECT records.*, artists.artname
                     FROM records
                     JOIN artists ON records.artid = artists.id
                     JOIN record_genres ON record_genres.record_id = records.id
                     JOIN genres ON record_genres.genre_id = genres.id
                     WHERE genres.name = ?`;
      db.all(query, [genre], (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      })
    })
  },

  findByEra: (era) => {
    return new Promise((resolve, reject) => {
      const query = `SELECT records.*, artists.artname
                     FROM records
                     JOIN artists ON records.artid = artists.id
                     WHERE CAST(substr(records.release_date, 1, 4) AS INTEGER) BETWEEN ? AND ?`;
      db.all(query, [era, Number(era) + 9], (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      })
    })
  },

  findAllWithGenres: () => {
    return new Promise((resolve, reject) => {
      const query = `SELECT records.id, records.recordname, records.image, records.release_date, records.language,
                       artists.id AS artist_id, artists.artname,
                       (SELECT GROUP_CONCAT(genres.name) FROM record_genres JOIN genres ON genres.id = record_genres.genre_id
                        WHERE record_genres.record_id = records.id) AS genres,
                       COALESCE((SELECT ROUND(AVG(rating), 2) FROM record_ratings WHERE record_id = records.id), 0) AS average,
                       (SELECT COUNT(*) FROM record_ratings WHERE record_id = records.id) AS count
                     FROM records
                     LEFT JOIN artists ON artists.id = records.artid`;
      db.all(query, [], (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  },

  findLanguages: () => {
    return new Promise((resolve, reject) => {
      const query = `SELECT DISTINCT language FROM records WHERE language IS NOT NULL AND language != '' ORDER BY language`;
      db.all(query, [], (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  },

  discoverRecords: (genre, era) => {
    return new Promise((resolve, reject) => {
      const query = `SELECT records.*, artists.artname
                     FROM records
                     JOIN artists ON records.artid = artists.id
                     JOIN record_genres ON record_genres.record_id = records.id
                     JOIN genres ON record_genres.genre_id = genres.id
                     WHERE genres.name = ?
                       AND CAST(substr(records.release_date, 1, 4) AS INTEGER) BETWEEN ? AND ?`;
      db.all(query, [genre, era, Number(era) + 9], (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      })
    })
  }
};

module.exports = Record;