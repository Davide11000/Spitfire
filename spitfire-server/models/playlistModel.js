const db = require("../db/db");

const Playlist = {
    create : (name, username, image, isPublic) => {
        return new Promise((resolve, reject) => {
            const query = `INSERT INTO playlists (name, username, image, is_public) VALUES (?,?,?,?)`;
            db.run(query, [name, username, image, isPublic], function (err) {
                if (err) reject(err);
                else resolve({ id: this.lastID, name, username, image, is_public: isPublic });
                    
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