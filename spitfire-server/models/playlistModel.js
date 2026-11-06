const db = require("../db/db");

const Playlist = {
    create : (name, username, image, isPublic, description) => {
        return new Promise((resolve, reject) => {
            const query = `INSERT INTO playlists (name, username, image, is_public, description) VALUES (?,?,?,?,?)`;
            db.run(query, [name, username, image, isPublic, description], function (err) {
                if (err) reject(err);
                else resolve({ id: this.lastID, name, username, image, is_public: isPublic, description });
                    
            });
        });
    },

    setUpdated : (playlistId) => {
        return new Promise((resolve, reject) => {
            const query = `UPDATE playlists SET updated_at = CURRENT_TIMESTAMP WHERE id = ?`;
            db.run(query, [playlistId], function (err) {
                if (err) reject(err);
                else resolve({ id: playlistId });
            });
        });
    },

    findDetails : (playlistId, username) => {
        return new Promise((resolve, reject) => {
            const query = `SELECT playlists.*, users.foto_profilo,
                             (SELECT COUNT(*) FROM playlist_likes WHERE playlist_id = playlists.id) AS likes,
                             (SELECT COUNT(*) FROM playlist_likes WHERE playlist_id = playlists.id AND username = ?) AS liked
                           FROM playlists
                           LEFT JOIN users ON users.username = playlists.username
                           WHERE playlists.id = ?`;
            db.get(query, [username, playlistId], (err, row) => {
                if (err) reject(err);
                else resolve(row);
            });
        });
    },

    findPopular : (limit) => {
        return new Promise((resolve, reject) => {
            const query = `SELECT playlists.*, users.foto_profilo,
                             (SELECT COUNT(*) FROM playlist_likes WHERE playlist_id = playlists.id) AS likes,
                             (SELECT COUNT(*) FROM playlist_songs WHERE playlist_id = playlists.id) AS songs
                           FROM playlists
                           LEFT JOIN users ON users.username = playlists.username
                           WHERE playlists.is_public = 1
                           ORDER BY likes DESC, playlists.updated_at DESC
                           LIMIT ?`;
            db.all(query, [limit], (err, rows) => {
                if (err) reject(err);
                else resolve(rows);
            });
        });
    },

    findRecent : (limit) => {
        return new Promise((resolve, reject) => {
            const query = `SELECT playlists.*, users.foto_profilo,
                             (SELECT COUNT(*) FROM playlist_likes WHERE playlist_id = playlists.id) AS likes,
                             (SELECT COUNT(*) FROM playlist_songs WHERE playlist_id = playlists.id) AS songs
                           FROM playlists
                           LEFT JOIN users ON users.username = playlists.username
                           WHERE playlists.is_public = 1
                           ORDER BY playlists.updated_at DESC, playlists.id DESC
                           LIMIT ?`;
            db.all(query, [limit], (err, rows) => {
                if (err) reject(err);
                else resolve(rows);
            });
        });
    },

    searchPublic : (text) => {
        return new Promise((resolve, reject) => {
            const query = `SELECT playlists.*, users.foto_profilo,
                             (SELECT COUNT(*) FROM playlist_likes WHERE playlist_id = playlists.id) AS likes,
                             (SELECT COUNT(*) FROM playlist_songs WHERE playlist_id = playlists.id) AS songs
                           FROM playlists
                           LEFT JOIN users ON users.username = playlists.username
                           WHERE playlists.is_public = 1 AND playlists.name LIKE ?
                           ORDER BY likes DESC, playlists.updated_at DESC`;
            db.all(query, ["%" + text + "%"], (err, rows) => {
                if (err) reject(err);
                else resolve(rows);
            });
        });
    },

    addLike : (playlistId, username) => {
        return new Promise((resolve, reject) => {
            const query = `INSERT INTO playlist_likes (playlist_id, username) VALUES (?, ?)`;
            db.run(query, [playlistId, username], function (err) {
                if (err) reject(err);
                else resolve({ playlistId, username });
            });
        });
    },

    removeLike : (playlistId, username) => {
        return new Promise((resolve, reject) => {
            const query = `DELETE FROM playlist_likes WHERE playlist_id = ? AND username = ?`;
            db.run(query, [playlistId, username], function (err) {
                if (err) reject(err);
                else resolve({ playlistId, username });
            });
        });
    },

    removeAllLikes : (playlistId) => {
        return new Promise((resolve, reject) => {
            const query = `DELETE FROM playlist_likes WHERE playlist_id = ?`;
            db.run(query, [playlistId], function (err) {
                if (err) reject(err);
                else resolve({ playlistId });
            });
        });
    },

    // Toglie dalla playlist tutte le sue canzoni (serve prima di eliminarla)
    removeAllSongs : (playlistId) => {
        return new Promise((resolve, reject) => {
            const query = `DELETE FROM playlist_songs WHERE playlist_id = ?`;
            db.run(query, [playlistId], function (err) {
                if (err) reject(err);
                else resolve({ playlistId });
            });
        });
    },

    delete : (playlistId) => {
        return new Promise((resolve, reject) => {
            const query = `DELETE FROM playlists WHERE id = ?`;
            db.run(query, [playlistId], function (err) {
                if (err) reject(err);
                else resolve({ id: playlistId });
            });
        });
    },

    setVisibility : (playlistId, isPublic) => {
        return new Promise((resolve, reject) => {
            const query = `UPDATE playlists SET is_public = ? WHERE id = ?`;
            db.run(query, [isPublic, playlistId], function (err) {
                if (err) reject(err);
                else resolve({ id: playlistId, is_public: isPublic });
            });
        });
    },

    addSong : (playlistId, songId) => {
        return new Promise((resolve, reject) => {
            const query = `INSERT INTO playlist_songs (playlist_id, song_id) VALUES (?,?)`;
            db.run(query, [playlistId, songId], function (err) {
                if (err) reject(err);
                else resolve({playlistId, songId});
            });
        });
    },

    removeSong : (playlistId, songId) => {
        return new Promise((resolve, reject) => {
            const query = `DELETE FROM playlist_songs WHERE playlist_id = ? AND song_id = ?`;
            db.run(query, [playlistId, songId], function (err) {
                if (err) reject(err);
                else resolve({playlistId, songId});
            });
        });
    },

    getSongs : (playlistId) => {
        return new Promise((resolve, reject) => {
            const query = `SELECT songs.id, songs.songname, songs.recordid, songs.image, artists.artname, records.image AS recordimage
                            FROM playlist_songs 
                            JOIN songs ON playlist_songs.song_id = songs.id
                            JOIN records ON songs.recordid = records.id
                            JOIN artists ON records.artid = artists.id
                            WHERE playlist_songs.playlist_id = ?`;
            db.all(query, [playlistId], (err, row) => {
                if (err) reject(err);
                else resolve(row);
            });
        });
    },

    findByUsername: (username) => {
        return new Promise((resolve, reject) => {
            const query = `SELECT * FROM playlists WHERE username = ?`;
            db.all(query, [username], (err, rows) => {
                if (err) reject(err);
                else resolve(rows);
            });
        });
    },

    findPublicByUsername: (username) => {
        return new Promise((resolve, reject) => {
            const query = `SELECT * FROM playlists WHERE username = ? AND is_public = 1`;
            db.all(query, [username], (err, rows) => {
                if (err) reject(err);
                else resolve(rows);
            });
        });
    },
    
    findById: (playlistId) => {
        return new Promise((resolve, reject) => {
            const query = `SELECT * FROM playlists WHERE id = ?`;
            db.get(query, [playlistId], (err, row) => {
                if (err) reject(err);
                else resolve(row);
            });
        });
    }
};

module.exports = Playlist;