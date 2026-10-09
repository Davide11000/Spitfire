const db = require("../db/db");

const Artist = {
  create: (artname) => {
    return new Promise((resolve, reject) => {
      const query = `INSERT INTO artists (artname) VALUES (?)`;
      db.run(query, [artname], function (err) {
        if (err) reject(err);
        else resolve({ id: this.lastID, artname});
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