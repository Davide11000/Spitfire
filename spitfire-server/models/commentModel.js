const db = require("../db/db");

const Comment = {
    create : (username, targetType, targetId, parentId, text) => {
        return new Promise((resolve, reject) => {
            const query = `INSERT INTO comments (username, target_type, target_id, parent_id, text) VALUES (?,?,?,?,?)`;
            db.run(query, [username, targetType, targetId, parentId, text], function (err) {
                if (err) reject(err);
                else resolve({ id: this.lastID });
            });
        });
    },

    findById : (id, username) => {
        return new Promise((resolve, reject) => {
            const query = `SELECT comments.*, users.foto_profilo,
                             (SELECT COUNT(*) FROM comment_likes WHERE comment_id = comments.id) AS likes,
                             (SELECT COUNT(*) FROM comment_likes WHERE comment_id = comments.id AND username = ?) AS liked,
                             (SELECT COUNT(*) FROM comments AS replies WHERE replies.parent_id = comments.id) AS replies
                           FROM comments
                           LEFT JOIN users ON users.username = comments.username
                           WHERE comments.id = ?`;
            db.get(query, [username, id], (err, row) => {
                if (err) reject(err);
                else resolve(row);
            });
        });
    },

    findByTarget : (targetType, targetId, username, limit, offset) => {
        return new Promise((resolve, reject) => {
            const query = `SELECT comments.*, users.foto_profilo,
                             (SELECT COUNT(*) FROM comment_likes WHERE comment_id = comments.id) AS likes,
                             (SELECT COUNT(*) FROM comment_likes WHERE comment_id = comments.id AND username = ?) AS liked,
                             (SELECT COUNT(*) FROM comments AS replies WHERE replies.parent_id = comments.id) AS replies
                           FROM comments
                           LEFT JOIN users ON users.username = comments.username
                           WHERE comments.target_type = ? AND comments.target_id = ? AND comments.parent_id IS NULL
                           ORDER BY comments.id DESC
                           LIMIT ? OFFSET ?`;
            db.all(query, [username, targetType, targetId, limit, offset], (err, rows) => {
                if (err) reject(err);
                else resolve(rows);
            });
        });
    },

    countByTarget : (targetType, targetId) => {
        return new Promise((resolve, reject) => {
            const query = `SELECT COUNT(*) AS total FROM comments
                           WHERE target_type = ? AND target_id = ? AND parent_id IS NULL`;
            db.get(query, [targetType, targetId], (err, row) => {
                if (err) reject(err);
                else resolve(row.total);
            });
        });
    },

    findReplies : (parentId, username) => {
        return new Promise((resolve, reject) => {
            const query = `SELECT comments.*, users.foto_profilo,
                             (SELECT COUNT(*) FROM comment_likes WHERE comment_id = comments.id) AS likes,
                             (SELECT COUNT(*) FROM comment_likes WHERE comment_id = comments.id AND username = ?) AS liked
                           FROM comments
                           LEFT JOIN users ON users.username = comments.username
                           WHERE comments.parent_id = ?
                           ORDER BY comments.id ASC`;
            db.all(query, [username, parentId], (err, rows) => {
                if (err) reject(err);
                else resolve(rows);
            });
        });
    },

    removeLikes : (id) => {
        return new Promise((resolve, reject) => {
            const query = `DELETE FROM comment_likes
                           WHERE comment_id = ? OR comment_id IN (SELECT id FROM comments WHERE parent_id = ?)`;
            db.run(query, [id, id], function (err) {
                if (err) reject(err);
                else resolve({ id });
            });
        });
    },

    delete : (id) => {
        return new Promise((resolve, reject) => {
            const query = `DELETE FROM comments WHERE id = ? OR parent_id = ?`;
            db.run(query, [id, id], function (err) {
                if (err) reject(err);
                else resolve({ id });
            });
        });
    },

    addLike : (id, username) => {
        return new Promise((resolve, reject) => {
            const query = `INSERT INTO comment_likes (comment_id, username) VALUES (?, ?)`;
            db.run(query, [id, username], function (err) {
                if (err) reject(err);
                else resolve({ id, username });
            });
        });
    },

    removeLike : (id, username) => {
        return new Promise((resolve, reject) => {
            const query = `DELETE FROM comment_likes WHERE comment_id = ? AND username = ?`;
            db.run(query, [id, username], function (err) {
                if (err) reject(err);
                else resolve({ id, username });
            });
        });
    }
};

module.exports = Comment;
