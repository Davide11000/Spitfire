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

  // Cerca gli artisti il cui nome contiene il testo
  search: (text) => {
    return new Promise((resolve, reject) => {
      const query = `SELECT * FROM artists WHERE artname LIKE ?`;
      db.all(query, ["%" + text + "%"], (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  }
};

module.exports = Artist;