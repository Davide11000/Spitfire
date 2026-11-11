const db = require("../db/db");

const PasswordReset = {
  create: (token, username, expiresAt) => {
    return new Promise((resolve, reject) => {
      const query = `INSERT INTO password_resets (token, username, expires_at) VALUES (?, ?, ?)`;
      db.run(query, [token, username, expiresAt], function (err) {
        if (err) reject(err);
        else resolve({ token, username, expiresAt });
      });
    });
  },

  findByToken: (token) => {
    return new Promise((resolve, reject) => {
      const query = `SELECT * FROM password_resets WHERE token = ?`;
      db.get(query, [token], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
  },

  removeByUsername: (username) => {
    return new Promise((resolve, reject) => {
      const query = `DELETE FROM password_resets WHERE username = ?`;
      db.run(query, [username], function (err) {
        if (err) reject(err);
        else resolve({ username });
      });
    });
  }
};

module.exports = PasswordReset;
