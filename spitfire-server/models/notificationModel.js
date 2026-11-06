const db = require("../db/db");

const Notification = {
    create : (username, type, fromUser, commentId, text) => {
        return new Promise((resolve, reject) => {
            const query = `INSERT INTO notifications (username, type, from_user, comment_id, text) VALUES (?, ?, ?, ?, ?)`;
            db.run(query, [username, type, fromUser, commentId, text], function (err) {
                if (err) reject(err);
                else resolve({ id: this.lastID });
            });
        });
    },

    findByUsername : (username) => {
        return new Promise((resolve, reject) => {
            const query = `SELECT notifications.*, users.foto_profilo,
                             comments.text AS comment_text, comments.target_type, comments.target_id,
                             playlists.name AS playlist_name
                           FROM notifications
                           LEFT JOIN users ON users.username = notifications.from_user
                           LEFT JOIN comments ON comments.id = notifications.comment_id
                           LEFT JOIN playlists ON playlists.id = notifications.playlist_id
                           WHERE notifications.username = ?
                           ORDER BY notifications.id DESC
                           LIMIT 50`;
            db.all(query, [username], (err, rows) => {
                if (err) reject(err);
                else resolve(rows);
            });
        });
    },

    createPlaylistLike : (username, fromUser, playlistId) => {
        return new Promise((resolve, reject) => {
            const query = `INSERT INTO notifications (username, type, from_user, playlist_id) VALUES (?, 'playlist_like', ?, ?)`;
            db.run(query, [username, fromUser, playlistId], function (err) {
                if (err) reject(err);
                else resolve({ id: this.lastID });
            });
        });
    },

    removePlaylistLike : (username, fromUser, playlistId) => {
        return new Promise((resolve, reject) => {
            const query = `DELETE FROM notifications WHERE username = ? AND from_user = ? AND type = 'playlist_like' AND playlist_id = ?`;
            db.run(query, [username, fromUser, playlistId], function (err) {
                if (err) reject(err);
                else resolve({ username, fromUser, playlistId });
            });
        });
    },

    removeByPlaylist : (playlistId) => {
        return new Promise((resolve, reject) => {
            const query = `DELETE FROM notifications WHERE playlist_id = ?`;
            db.run(query, [playlistId], function (err) {
                if (err) reject(err);
                else resolve({ playlistId });
            });
        });
    },

    countUnread : (username) => {
        return new Promise((resolve, reject) => {
            const query = `SELECT COUNT(*) AS unread FROM notifications WHERE username = ? AND is_read = 0`;
            db.get(query, [username], (err, row) => {
                if (err) reject(err);
                else resolve(row.unread);
            });
        });
    },

    markAllAsRead : (username) => {
        return new Promise((resolve, reject) => {
            const query = `UPDATE notifications SET is_read = 1 WHERE username = ? AND is_read = 0`;
            db.run(query, [username], function (err) {
                if (err) reject(err);
                else resolve({ username });
            });
        });
    },

    findUnreadMessage : (username, fromUser) => {
        return new Promise((resolve, reject) => {
            const query = `SELECT * FROM notifications WHERE username = ? AND from_user = ? AND type = 'message' AND is_read = 0`;
            db.get(query, [username, fromUser], (err, row) => {
                if (err) reject(err);
                else resolve(row);
            });
        });
    },

    updateMessage : (id, text) => {
        return new Promise((resolve, reject) => {
            const query = `UPDATE notifications SET text = ?, created_at = CURRENT_TIMESTAMP WHERE id = ?`;
            db.run(query, [text, id], function (err) {
                if (err) reject(err);
                else resolve({ id, text });
            });
        });
    },

    markMessagesAsRead : (username, fromUser) => {
        return new Promise((resolve, reject) => {
            const query = `UPDATE notifications SET is_read = 1 WHERE username = ? AND from_user = ? AND type = 'message' AND is_read = 0`;
            db.run(query, [username, fromUser], function (err) {
                if (err) reject(err);
                else resolve({ username, fromUser });
            });
        });
    },

    removeFollow : (username, fromUser) => {
        return new Promise((resolve, reject) => {
            const query = `DELETE FROM notifications WHERE username = ? AND from_user = ? AND type = 'follow'`;
            db.run(query, [username, fromUser], function (err) {
                if (err) reject(err);
                else resolve({ username, fromUser });
            });
        });
    },

    removeLike : (username, fromUser, commentId) => {
        return new Promise((resolve, reject) => {
            const query = `DELETE FROM notifications WHERE username = ? AND from_user = ? AND type = 'like' AND comment_id = ?`;
            db.run(query, [username, fromUser, commentId], function (err) {
                if (err) reject(err);
                else resolve({ username, fromUser, commentId });
            });
        });
    },

    removeByComment : (commentId) => {
        return new Promise((resolve, reject) => {
            const query = `DELETE FROM notifications
                           WHERE comment_id = ? OR comment_id IN (SELECT id FROM comments WHERE parent_id = ?)`;
            db.run(query, [commentId, commentId], function (err) {
                if (err) reject(err);
                else resolve({ commentId });
            });
        });
    }
};

module.exports = Notification;
