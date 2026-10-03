const db = require("../db/db");

const User = {
  create: (username, email, password) => {
    return new Promise((resolve, reject) => {
      const sameUsername = `SELECT * FROM users WHERE username = ?`;
      db.run(sameUsername, username, function (runresult, err) {
        if (err) reject(err);
        if (runresult) reject("User with that username already exists");
      });

      const sameEmail = `SELECT * FROM users WHERE email = ?`;
      db.run(sameEmail, email, function (runresult, err) {
        if (err) reject(err);
        if (runresult) reject("An account associated with this email already exists");
      });

      const samePassword = `SELECT * FROM users WHERE password = ?`;
      db.run(samePassword, password, function (runresult, err) {
        if (err) reject(err);
        if (runresult) reject("User with that password already exists");
      });

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
  }
};

module.exports = User;