const db = require("../db/db");

// Per ogni tipo: la tabella dei voti, la colonna con l'id e la tabella dove salvo la media
const tables = {
  song: { ratings: "song_ratings", column: "song_id", target: "songs" },
  record: { ratings: "record_ratings", column: "record_id", target: "records" }
};

const Rating = {
  getSummary: (type, id) => {
    const t = tables[type];
    return new Promise((resolve, reject) => {
      const query = `SELECT AVG(rating) AS average, COUNT(*) AS count FROM ${t.ratings} WHERE ${t.column} = ?`;
      db.get(query, [id], (err, row) => {
        if (err) reject(err);
        else resolve({ average: row.average ? Math.round(row.average * 100) / 100 : 0, count: row.count });
      });
    });
  },

  findByUser: (type, id, username) => {
    const t = tables[type];
    return new Promise((resolve, reject) => {
      const query = `SELECT rating FROM ${t.ratings} WHERE ${t.column} = ? AND username = ?`;
      db.get(query, [id, username], (err, row) => {
        if (err) reject(err);
        else resolve(row ? row.rating : 0);
      });
    });
  },

  save: (type, id, username, rating) => {
    const t = tables[type];
    return new Promise((resolve, reject) => {
      const query = `INSERT INTO ${t.ratings} (${t.column}, username, rating) VALUES (?, ?, ?)
                     ON CONFLICT(${t.column}, username) DO UPDATE SET rating = excluded.rating`;
      db.run(query, [id, username, rating], function (err) {
        if (err) reject(err);
        else resolve({ id, username, rating });
      });
    });
  },

  remove: (type, id, username) => {
    const t = tables[type];
    return new Promise((resolve, reject) => {
      const query = `DELETE FROM ${t.ratings} WHERE ${t.column} = ? AND username = ?`;
      db.run(query, [id, username], function (err) {
        if (err) reject(err);
        else resolve({ id, username });
      });
    });
  },

  // Salvo la media anche nella colonna rating di songs/records (serve per le classifiche)
  updateAverage: (type, id, average) => {
    const t = tables[type];
    return new Promise((resolve, reject) => {
      const query = `UPDATE ${t.target} SET rating = ? WHERE id = ?`;
      db.run(query, [average, id], function (err) {
        if (err) reject(err);
        else resolve({ id, average });
      });
    });
  }
};

module.exports = Rating;
