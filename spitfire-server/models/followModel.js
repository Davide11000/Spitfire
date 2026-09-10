const db = require("../db/db");

const Follow = {
    follow : (follower, following) => {
        return new Promise((resolve, reject) => {
            const query = `INSERT INTO follows (follower, following) VALUES (?, ?)`;
            db.run(query, [follower, following], function (err) {
                if (err) reject(err);
                else resolve({follower, following});
            });

        });
    },

    unfollow : (follower, following) => {
        return new Promise((resolve, reject) => {
            const query = `DELETE FROM follows WHERE follower = ? AND following = ?`;
            db.run(query, [follower, following], function (err) {
                if (err) reject(err);
                else resolve({follower, following});
            });

        });
    },

    findFollowers : (username) => {
        return new Promise((resolve, reject) => {
            const query = `SELECT * FROM follows WHERE following = ?`;
            db.all(query, [username], (err, row) => {
                if (err) reject(err);
                else resolve(row);
            });
        });
    },

    findFollowing: (username) => {
        return new Promise((resolve, reject) => {
            const query = `SELECT * FROM follows WHERE follower = ?`;
            db.all(query, [username], (err, row) => {
                if (err) reject(err);
                else resolve(row);
            });
        });
    }
};

module.exports = Follow;