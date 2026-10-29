const db = require("../db/db");

const Lyrics = {
    create: (songid, language, lyrics) => {
        return new Promise((resolve, reject) => {
              const query = `INSERT INTO lyrics (songid, language, lyrics) VALUES (?, ?, ?)`;
              db.run(query, [songid, language, lyrics], function (err) {
                if (err) reject(err);
                else resolve({songid, language, lyrics});
              });
            });
    },

    findBySongId: (songid) => {
        return new Promise((resolve, reject) => {
            const query = `SELECT * FROM lyrics WHERE songid = ?`;
            db.all(query, [songid], (err, row) => {
                    if (err) reject(err);
                    else resolve(row);
                  });
        });
    }
}

module.exports = Lyrics;