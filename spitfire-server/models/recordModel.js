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

  findById: (Id) => {
    return new Promise((resolve, reject) => {
      const query = `SELECT * FROM records WHERE id = ?`;
      db.get(query, [Id], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
  },

  // Cerca gli album il cui nome contiene il testo
  search: (text) => {
    return new Promise((resolve, reject) => {
      const query = `SELECT records.*, artists.artname
                     FROM records
                     JOIN artists ON records.artid = artists.id
                     WHERE records.recordname LIKE ?`;
      db.all(query, ["%" + text + "%"], (err, rows) => {
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