const db = require("../db/db");

const Artist = {
  create: (artname, id) => {
    return new Promise((resolve, reject) => {
      const query = `INSERT INTO artists (artname) VALUES (?)`;
      db.run(query, [artname, id], function (err) {
        if (err) reject(err);
        else resolve({ artname, id });
      });
    });
  },

  findByArtname: (artname) => {
    return new Promise((resolve, reject) => {
      const query = `SELECT * FROM artists WHERE artname = ?`;
      db.get(query, [artname], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
  },

  findById: (id) => {
    return new Promise((resolve, reject) => {
      const query = `SELECT * FROM artists WHERE id = ?`;
      db.get(query, [id], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
  },
};

module.exports = Artist;