const db = require("../db/db");

const RoleRequest = {
  create: (username, text) => {
    return new Promise((resolve, reject) => {
      const query = `INSERT INTO role_requests (username, text) VALUES (?, ?)`;
      db.run(query, [username, text], function (err) {
        if (err) reject(err);
        else resolve({ id: this.lastID, username, text, status: "pending" });
      });
    });
  },

  findById: (id) => {
    return new Promise((resolve, reject) => {
      const query = `SELECT * FROM role_requests WHERE id = ?`;
      db.get(query, [id], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
  },

  findLastByUsername: (username) => {
    return new Promise((resolve, reject) => {
      const query = `SELECT * FROM role_requests WHERE username = ? ORDER BY id DESC LIMIT 1`;
      db.get(query, [username], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
  },

  findPending: () => {
    return new Promise((resolve, reject) => {
      const query = `SELECT role_requests.*, users.foto_profilo,
                       (SELECT COUNT(*) FROM requests
                        WHERE requests.username = role_requests.username AND requests.status = 'accepted') AS accepted
                     FROM role_requests
                     JOIN users ON users.username = role_requests.username
                     WHERE role_requests.status = 'pending'
                     ORDER BY role_requests.id`;
      db.all(query, [], (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  },

  countAccepted: (username) => {
    return new Promise((resolve, reject) => {
      const query = `SELECT COUNT(*) AS total FROM requests WHERE username = ? AND status = 'accepted'`;
      db.get(query, [username], (err, row) => {
        if (err) reject(err);
        else resolve(row.total);
      });
    });
  },

  setStatus: (id, status) => {
    return new Promise((resolve, reject) => {
      const query = `UPDATE role_requests SET status = ? WHERE id = ?`;
      db.run(query, [status, id], function (err) {
        if (err) reject(err);
        else resolve({ id, status });
      });
    });
  }
};

module.exports = RoleRequest;
