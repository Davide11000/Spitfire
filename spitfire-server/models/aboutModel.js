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

const About = {
    create : (targetType, targetId, username, text, status) => {
        return run(`INSERT INTO abouts (target_type, target_id, username, text, status) VALUES (?, ?, ?, ?, ?)`,
                   [targetType, targetId, username, text, status]);
    },

    findById : (id) => {
        return get(`SELECT * FROM abouts WHERE id = ?`, [id]);
    },

    findActive : (targetType, targetId) => {
        return get(`SELECT * FROM abouts WHERE target_type = ? AND target_id = ? AND status IN ('approved', 'pending')`,
                   [targetType, targetId]);
    },

    findWithVotes : (id, username) => {
        return get(`SELECT abouts.*,
                      (SELECT COALESCE(SUM(value), 0) FROM about_votes WHERE about_id = abouts.id) AS score,
                      (SELECT value FROM about_votes WHERE about_id = abouts.id AND username = ?) AS my_vote
                    FROM abouts WHERE abouts.id = ?`, [username, id]);
    },

    setStatus : (id, status) => {
        return run(`UPDATE abouts SET status = ? WHERE id = ?`, [status, id]);
    },

    updateText : (id, text) => {
        return run(`UPDATE abouts SET text = ? WHERE id = ?`, [text, id]);
    },

    setVote : async (id, username, value) => {
        await run(`DELETE FROM about_votes WHERE about_id = ? AND username = ?`, [id, username]);
        if (value !== 0) {
            await run(`INSERT INTO about_votes (about_id, username, value) VALUES (?, ?, ?)`, [id, username, value]);
        }
    },

    getScore : (id) => {
        return get(`SELECT COALESCE(SUM(value), 0) AS score FROM about_votes WHERE about_id = ?`, [id]);
    },

    createEdit : (aboutId, username, text, status) => {
        return run(`INSERT INTO about_edits (about_id, username, text, status) VALUES (?, ?, ?, ?)`, [aboutId, username, text, status]);
    },

    findEditById : (id) => {
        return get(`SELECT * FROM about_edits WHERE id = ?`, [id]);
    },

    findPendingEdits : (aboutId) => {
        return all(`SELECT * FROM about_edits WHERE about_id = ? AND status = 'pending' ORDER BY id`, [aboutId]);
    },

    findPendingEditByUser : (aboutId, username) => {
        return get(`SELECT * FROM about_edits WHERE about_id = ? AND username = ? AND status = 'pending'`, [aboutId, username]);
    },

    setEditStatus : (id, status) => {
        return run(`UPDATE about_edits SET status = ? WHERE id = ?`, [status, id]);
    },

    delete : async (id) => {
        await run(`DELETE FROM about_votes WHERE about_id = ?`, [id]);
        await run(`DELETE FROM about_edits WHERE about_id = ?`, [id]);
        await run(`DELETE FROM abouts WHERE id = ?`, [id]);
    }
};

module.exports = About;
