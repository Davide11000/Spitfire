const db = require("../db/db");

const Report = {
    create : (commentId, username, reason) => {
        return new Promise((resolve, reject) => {
            const query = `INSERT INTO comment_reports (comment_id, username, reason) VALUES (?, ?, ?)`;
            db.run(query, [commentId, username, reason], function (err) {
                if (err) reject(err);
                else resolve({ id: this.lastID, comment_id: commentId, username, reason, status: "pending" });
            });
        });
    },

    findById : (id) => {
        return new Promise((resolve, reject) => {
            const query = `SELECT * FROM comment_reports WHERE id = ?`;
            db.get(query, [id], (err, row) => {
                if (err) reject(err);
                else resolve(row);
            });
        });
    },

    findPendingByUser : (commentId, username) => {
        return new Promise((resolve, reject) => {
            const query = `SELECT * FROM comment_reports WHERE comment_id = ? AND username = ? AND status = 'pending'`;
            db.get(query, [commentId, username], (err, row) => {
                if (err) reject(err);
                else resolve(row);
            });
        });
    },

    findPending : () => {
        return new Promise((resolve, reject) => {
            const query = `SELECT comment_reports.*,
                             comments.text AS comment_text,
                             comments.username AS comment_author,
                             comments.created_at AS comment_date,
                             comments.parent_id,
                             comments.target_type,
                             comments.target_id,
                             users.foto_profilo AS author_photo,
                             CASE comments.target_type
                               WHEN 'song' THEN (SELECT songname FROM songs WHERE songs.id = comments.target_id)
                               WHEN 'record' THEN (SELECT recordname FROM records WHERE records.id = comments.target_id)
                               WHEN 'artist' THEN (SELECT artname FROM artists WHERE artists.id = comments.target_id)
                               WHEN 'playlist' THEN (SELECT name FROM playlists WHERE playlists.id = comments.target_id)
                               WHEN 'annotation' THEN (SELECT selected_text FROM annotations WHERE annotations.id = comments.target_id)
                             END AS target_name
                           FROM comment_reports
                           JOIN comments ON comments.id = comment_reports.comment_id
                           LEFT JOIN users ON users.username = comments.username
                           WHERE comment_reports.status = 'pending'
                           ORDER BY comment_reports.id ASC`;
            db.all(query, [], (err, rows) => {
                if (err) reject(err);
                else resolve(rows);
            });
        });
    },

    setStatus : (id, status) => {
        return new Promise((resolve, reject) => {
            const query = `UPDATE comment_reports SET status = ? WHERE id = ?`;
            db.run(query, [status, id], function (err) {
                if (err) reject(err);
                else resolve({ id, status });
            });
        });
    },

    createForAnnotation : (annotationId, username, reason) => {
        return new Promise((resolve, reject) => {
            const query = `INSERT INTO annotation_reports (annotation_id, username, reason) VALUES (?, ?, ?)`;
            db.run(query, [annotationId, username, reason], function (err) {
                if (err) reject(err);
                else resolve({ id: this.lastID, annotation_id: annotationId, username, reason, status: "pending" });
            });
        });
    },

    findAnnotationReportById : (id) => {
        return new Promise((resolve, reject) => {
            const query = `SELECT * FROM annotation_reports WHERE id = ?`;
            db.get(query, [id], (err, row) => {
                if (err) reject(err);
                else resolve(row);
            });
        });
    },

    findPendingAnnotationByUser : (annotationId, username) => {
        return new Promise((resolve, reject) => {
            const query = `SELECT * FROM annotation_reports WHERE annotation_id = ? AND username = ? AND status = 'pending'`;
            db.get(query, [annotationId, username], (err, row) => {
                if (err) reject(err);
                else resolve(row);
            });
        });
    },

    findPendingAnnotations : () => {
        return new Promise((resolve, reject) => {
            const query = `SELECT annotation_reports.*,
                             annotations.selected_text, annotations.text AS annotation_text,
                             annotations.username AS annotation_author, annotations.created_at AS annotation_date,
                             annotations.song_id, songs.songname,
                             users.foto_profilo AS author_photo
                           FROM annotation_reports
                           JOIN annotations ON annotations.id = annotation_reports.annotation_id
                           LEFT JOIN songs ON songs.id = annotations.song_id
                           LEFT JOIN users ON users.username = annotations.username
                           WHERE annotation_reports.status = 'pending'
                           ORDER BY annotation_reports.id ASC`;
            db.all(query, [], (err, rows) => {
                if (err) reject(err);
                else resolve(rows);
            });
        });
    },

    setAnnotationStatus : (id, status) => {
        return new Promise((resolve, reject) => {
            const query = `UPDATE annotation_reports SET status = ? WHERE id = ?`;
            db.run(query, [status, id], function (err) {
                if (err) reject(err);
                else resolve({ id, status });
            });
        });
    },

    removeByComment : (commentId) => {
        return new Promise((resolve, reject) => {
            const query = `DELETE FROM comment_reports
                           WHERE comment_id = ? OR comment_id IN (SELECT id FROM comments WHERE parent_id = ?)`;
            db.run(query, [commentId, commentId], function (err) {
                if (err) reject(err);
                else resolve({ commentId });
            });
        });
    }
};

module.exports = Report;
