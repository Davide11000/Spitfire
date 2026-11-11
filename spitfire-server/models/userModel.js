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

  findAdmins: () => {
    return new Promise((resolve, reject) => {
      const query = `SELECT username FROM users WHERE ruolo = 'admin'`;
      db.all(query, [], (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  },

  findModerators: () => {
    return new Promise((resolve, reject) => {
      const query = `SELECT username FROM users WHERE ruolo IN ('admin', 'moderatore')`;
      db.all(query, [], (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  },

  updateEmail: (username, email) => {
    return new Promise((resolve, reject) => {
      const query = `UPDATE users SET email = ? WHERE username = ?`;
      db.run(query, [email, username], function (err) {
        if (err) reject(err);
        else resolve({ username, email });
      });
    });
  },

  updatePassword: (username, password) => {
    return new Promise((resolve, reject) => {
      const query = `UPDATE users SET password = ? WHERE username = ?`;
      db.run(query, [password, username], function (err) {
        if (err) reject(err);
        else resolve({ username });
      });
    });
  },

  updateBio: (username, bio) => {
    return new Promise((resolve, reject) => {
      const query = `UPDATE users SET bio = ? WHERE username = ?`;
      db.run(query, [bio, username], function (err) {
        if (err) reject(err);
        else resolve({ username, bio });
      });
    });
  },

  updateWhoCanMessage: (username, whoCanMessage) => {
    return new Promise((resolve, reject) => {
      const query = `UPDATE users SET who_can_message = ? WHERE username = ?`;
      db.run(query, [whoCanMessage, username], function (err) {
        if (err) reject(err);
        else resolve({ username, who_can_message: whoCanMessage });
      });
    });
  },

  updateProfileColor: (username, color) => {
    return new Promise((resolve, reject) => {
      const query = `UPDATE users SET profile_color = ? WHERE username = ?`;
      db.run(query, [color, username], function (err) {
        if (err) reject(err);
        else resolve({ username, profile_color: color });
      });
    });
  },

  deleteAccount: async (username) => {
    const run = (query, params) => {
      return new Promise((resolve, reject) => {
        db.run(query, params, function (err) {
          if (err) reject(err);
          else resolve();
        });
      });
    };

    await run(`DELETE FROM follows WHERE follower = ? OR following = ?`, [username, username]);
    await run(`DELETE FROM playlist_likes WHERE username = ?`, [username]);
    await run(`DELETE FROM favourite_artists WHERE username = ?`, [username]);
    await run(`DELETE FROM favourite_records WHERE username = ?`, [username]);
    await run(`DELETE FROM favourite_songs WHERE username = ?`, [username]);
    await run(`DELETE FROM comment_likes WHERE username = ?`, [username]);
    await run(`DELETE FROM comment_reports WHERE username = ?`, [username]);
    await run(`DELETE FROM annotation_reports WHERE username = ?`, [username]);
    await run(`DELETE FROM notifications WHERE username = ? OR from_user = ?`, [username, username]);
    await run(`DELETE FROM messages WHERE sender = ? OR receiver = ?`, [username, username]);
    await run(`DELETE FROM blocks WHERE blocker = ? OR blocked = ?`, [username, username]);
    await run(`DELETE FROM requests WHERE username = ?`, [username]);
    await run(`UPDATE comments SET username = NULL WHERE username = ?`, [username]);
    await run(`DELETE FROM annotation_votes WHERE username = ?`, [username]);
    await run(`DELETE FROM song_ratings WHERE username = ?`, [username]);
    await run(`DELETE FROM record_ratings WHERE username = ?`, [username]);
    await run(`UPDATE songs SET rating = COALESCE((SELECT ROUND(AVG(rating), 2) FROM song_ratings WHERE song_id = songs.id), 0)`, []);
    await run(`UPDATE records SET rating = COALESCE((SELECT ROUND(AVG(rating), 2) FROM record_ratings WHERE record_id = records.id), 0)`, []);
    await run(`DELETE FROM contributions WHERE username = ?`, [username]);
    await run(`DELETE FROM annotation_edits WHERE username = ?`, [username]);
    await run(`DELETE FROM about_votes WHERE username = ?`, [username]);
    await run(`DELETE FROM about_edits WHERE username = ?`, [username]);
    await run(`UPDATE abouts SET username = NULL WHERE username = ?`, [username]);
    await run(`UPDATE annotations SET username = NULL WHERE username = ?`, [username]);
    await run(`DELETE FROM users WHERE username = ?`, [username]);
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

  search: (text) => {
    return new Promise((resolve, reject) => {
      const query = `SELECT username, foto_profilo FROM users WHERE username LIKE ?`;
      db.all(query, ["%" + text + "%"], (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  },
  
  getRole: (username) =>  {
    return new Promise((resolve, reject) => {
      const query = `SELECT ruolo FROM users WHERE username = ?`;
      db.get(query, [username], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    })
  }
};

module.exports = User;