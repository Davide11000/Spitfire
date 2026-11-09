const db = require("../db/db");

function run(query, params) {
    return new Promise((resolve, reject) => {
        db.run(query, params, function (err) {
            if (err) reject(err);
            else resolve({ id: this.lastID });
        });
    });
}

function all(query, params) {
    return new Promise((resolve, reject) => {
        db.all(query, params, (err, rows) => {
            if (err) reject(err);
            else resolve(rows);
        });
    });
}

function get(query, params) {
    return new Promise((resolve, reject) => {
        db.get(query, params, (err, row) => {
            if (err) reject(err);
            else resolve(row);
        });
    });
}

const Annotation = {
    create : (songId, username, start, end, selectedText, text, status) => {
        return run(`INSERT INTO annotations (song_id, username, start_index, end_index, selected_text, text, status)
                    VALUES (?, ?, ?, ?, ?, ?, ?)`, [songId, username, start, end, selectedText, text, status]);
    },

    findById : (id) => {
        return get(`SELECT * FROM annotations WHERE id = ?`, [id]);
    },

    findBySong : (songId, username, isModerator) => {
        return all(`SELECT annotations.*, users.foto_profilo,
                      (SELECT COALESCE(SUM(value), 0) FROM annotation_votes WHERE annotation_id = annotations.id) AS score,
                      (SELECT value FROM annotation_votes WHERE annotation_id = annotations.id AND username = ?) AS my_vote
                    FROM annotations
                    LEFT JOIN users ON users.username = annotations.username
                    WHERE annotations.song_id = ?
                      AND (annotations.status = 'approved' OR (annotations.status = 'pending' AND (annotations.username = ? OR ? = 1)))
                    ORDER BY annotations.start_index`, [username, songId, username, isModerator ? 1 : 0]);
    },

    findActiveBySong : (songId) => {
        return all(`SELECT * FROM annotations WHERE song_id = ? AND status IN ('approved', 'pending')`, [songId]);
    },

    setStatus : (id, status) => {
        return run(`UPDATE annotations SET status = ? WHERE id = ?`, [status, id]);
    },

    updateText : (id, text) => {
        return run(`UPDATE annotations SET text = ? WHERE id = ?`, [text, id]);
    },

    setVote : async (id, username, value) => {
        await run(`DELETE FROM annotation_votes WHERE annotation_id = ? AND username = ?`, [id, username]);
        if (value !== 0) {
            await run(`INSERT INTO annotation_votes (annotation_id, username, value) VALUES (?, ?, ?)`, [id, username, value]);
        }
    },

    // Punteggio: ogni mi piace vale +1, ogni non mi piace -1
    getScore : (id) => {
        return get(`SELECT COALESCE(SUM(value), 0) AS score FROM annotation_votes WHERE annotation_id = ?`, [id]);
    },

    createEdit : (annotationId, username, text, status) => {
        return run(`INSERT INTO annotation_edits (annotation_id, username, text, status) VALUES (?, ?, ?, ?)`,
                   [annotationId, username, text, status]);
    },

    findEditById : (id) => {
        return get(`SELECT * FROM annotation_edits WHERE id = ?`, [id]);
    },

    findPendingEdits : (songId) => {
        return all(`SELECT annotation_edits.* FROM annotation_edits
                    JOIN annotations ON annotations.id = annotation_edits.annotation_id
                    WHERE annotations.song_id = ? AND annotation_edits.status = 'pending'
                    ORDER BY annotation_edits.id`, [songId]);
    },

    findPendingEditByUser : (annotationId, username) => {
        return get(`SELECT * FROM annotation_edits WHERE annotation_id = ? AND username = ? AND status = 'pending'`, [annotationId, username]);
    },

    delete : async (id) => {
        await run(`DELETE FROM annotation_votes WHERE annotation_id = ?`, [id]);
        await run(`DELETE FROM annotation_edits WHERE annotation_id = ?`, [id]);
        await run(`DELETE FROM annotation_reports WHERE annotation_id = ?`, [id]);
        await run(`DELETE FROM notifications WHERE annotation_id = ?`, [id]);
        await run(`DELETE FROM annotations WHERE id = ?`, [id]);
    },

    setEditStatus : (id, status) => {
        return run(`UPDATE annotation_edits SET status = ? WHERE id = ?`, [status, id]);
    }
};

module.exports = Annotation;
