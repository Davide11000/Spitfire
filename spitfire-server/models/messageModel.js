const db = require("../db/db");

const Message = {
    create : (sender, receiver, text) => {
        return new Promise((resolve, reject) => {
            const query = `INSERT INTO messages (sender, receiver, text) VALUES (?, ?, ?)`;
            db.run(query, [sender, receiver, text], function (err) {
                if (err) reject(err);
                else resolve({ id: this.lastID });
            });
        });
    },

    findById : (id) => {
        return new Promise((resolve, reject) => {
            const query = `SELECT * FROM messages WHERE id = ?`;
            db.get(query, [id], (err, row) => {
                if (err) reject(err);
                else resolve(row);
            });
        });
    },

    findChat : (user1, user2, afterId) => {
        return new Promise((resolve, reject) => {
            const query = `SELECT * FROM messages
                           WHERE ((sender = ? AND receiver = ?) OR (sender = ? AND receiver = ?))
                             AND id > ?
                           ORDER BY id ASC`;
            db.all(query, [user1, user2, user2, user1, afterId], (err, rows) => {
                if (err) reject(err);
                else resolve(rows);
            });
        });
    },

    markAsRead : (sender, receiver) => {
        return new Promise((resolve, reject) => {
            const query = `UPDATE messages SET is_read = 1 WHERE sender = ? AND receiver = ? AND is_read = 0`;
            db.run(query, [sender, receiver], function (err) {
                if (err) reject(err);
                else resolve({ sender, receiver });
            });
        });
    },

    findConversations : (username) => {
        return new Promise((resolve, reject) => {
            const query = `SELECT messages.*, users.username AS other_user, users.foto_profilo,
                             (SELECT COUNT(*) FROM messages AS unread
                              WHERE unread.sender = users.username AND unread.receiver = ? AND unread.is_read = 0) AS unread
                           FROM messages
                           JOIN users ON users.username = CASE WHEN messages.sender = ? THEN messages.receiver ELSE messages.sender END
                           WHERE messages.id IN (
                             SELECT MAX(id) FROM messages
                             WHERE sender = ? OR receiver = ?
                             GROUP BY CASE WHEN sender = ? THEN receiver ELSE sender END
                           )
                           ORDER BY messages.id DESC`;
            db.all(query, [username, username, username, username, username], (err, rows) => {
                if (err) reject(err);
                else resolve(rows);
            });
        });
    },

    countUnread : (username) => {
        return new Promise((resolve, reject) => {
            const query = `SELECT COUNT(*) AS unread FROM messages WHERE receiver = ? AND is_read = 0`;
            db.get(query, [username], (err, row) => {
                if (err) reject(err);
                else resolve(row.unread);
            });
        });
    }
};

module.exports = Message;
