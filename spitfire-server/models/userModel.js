const db = require("../db/db");

const User = {
  create: (username, email, password) => {
    return new Promise((resolve, reject) => {
      const query = `INSERT INTO users (username, email, password) VALUES (?, ?, ?)`;
      db.run(query, [username, email, password], function (err) {
        if (err) reject(err);
        else resolve({ username, email });
      });
    });
  },

  findByEmail: (email) => {
    return new Promise((resolve, reject) => {
      const query = `SELECT * FROM users WHERE email = ?`;
      db.get(query, [email], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
  },

  findByUsername: (username) => {
    return new Promise((resolve, reject) => {
      const query = `SELECT * FROM users WHERE username = ?`;
      db.get(query, [username], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
  },

  updatePhoto: (username, photo) => {
    return new Promise((resolve, reject) => {
      const query = `UPDATE users SET foto_profilo = ? WHERE username = ?`;
      db.run(query, [photo, username], function (err) {
        if (err) reject(err);
        else resolve({ username, foto_profilo: photo });
      });
    });
  },

  // Cerca gli utenti il cui username contiene il testo
  // (restituisco solo username e foto: email e password non devono uscire)
  search: (text) => {
    return new Promise((resolve, reject) => {
      const query = `SELECT username, foto_profilo FROM users WHERE username LIKE ?`;
      db.all(query, ["%" + text + "%"], (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  }
};

module.exports = User;