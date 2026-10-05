const db = require("../db/db");

const Playlist = {
    create : (name, username) => {
        return new Promise((resolve, reject) => {
            const query = `INSERT INTO playlists (name, username) VALUES (?,?)`;
            db.run(query, [name, username], function (err) {
                if (err) reject(err);
                else resolve({ id: this.lastID, name, username });
                    
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
            const query = `SELECT songs.id, songs.songname, songs.recordid, artists.artname 
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