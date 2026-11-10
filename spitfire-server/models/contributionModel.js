const db = require("../db/db");

const Contribution = {
    add : (entityType, entityId, username) => {
        return new Promise((resolve, reject) => {
            const query = `INSERT OR IGNORE INTO contributions (entity_type, entity_id, username) VALUES (?, ?, ?)`;
            db.run(query, [entityType, entityId, username], function (err) {
                if (err) reject(err);
                else resolve({ entityType, entityId, username });
            });
        });
    },

    findByEntity : (entityType, entityId) => {
        return new Promise((resolve, reject) => {
            const query = `SELECT contributions.username, users.foto_profilo
                           FROM contributions
                           JOIN users ON users.username = contributions.username
                           WHERE contributions.entity_type = ? AND contributions.entity_id = ?
                           ORDER BY contributions.created_at`;
            db.all(query, [entityType, entityId], (err, rows) => {
                if (err) reject(err);
                else resolve(rows);
            });
        });
    },

    // Chi ha scritto l'about più chi ha una modifica approvata
    findByAbout : (aboutId) => {
        return new Promise((resolve, reject) => {
            const query = `SELECT users.username, users.foto_profilo FROM abouts
                           JOIN users ON users.username = abouts.username
                           WHERE abouts.id = ?
                           UNION
                           SELECT users.username, users.foto_profilo FROM about_edits
                           JOIN users ON users.username = about_edits.username
                           WHERE about_edits.about_id = ? AND about_edits.status = 'approved'`;
            db.all(query, [aboutId, aboutId], (err, rows) => {
                if (err) reject(err);
                else resolve(rows);
            });
        });
    },

    findByAnnotation : (annotationId) => {
        return new Promise((resolve, reject) => {
            const query = `SELECT users.username, users.foto_profilo FROM annotations
                           JOIN users ON users.username = annotations.username
                           WHERE annotations.id = ?
                           UNION
                           SELECT users.username, users.foto_profilo FROM annotation_edits
                           JOIN users ON users.username = annotation_edits.username
                           WHERE annotation_edits.annotation_id = ? AND annotation_edits.status = 'approved'`;
            db.all(query, [annotationId, annotationId], (err, rows) => {
                if (err) reject(err);
                else resolve(rows);
            });
        });
    }
};

module.exports = Contribution;
