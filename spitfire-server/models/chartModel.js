const db = require("../db/db");

const MIN_RATINGS = 30;

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

const Chart = {
  getRecords: (year, genre, limit, offset) => {
    return all(`SELECT records.id, records.recordname AS name, records.image, records.release_date,
                  artists.id AS artist_id, artists.artname,
                  ROUND(AVG(record_ratings.rating), 2) AS average, COUNT(record_ratings.rating) AS count
                FROM records
                JOIN record_ratings ON record_ratings.record_id = records.id
                LEFT JOIN artists ON artists.id = records.artid
                WHERE (? IS NULL OR substr(records.release_date, 1, 4) = ?)
                  AND (? IS NULL OR EXISTS (SELECT 1 FROM record_genres JOIN genres ON genres.id = record_genres.genre_id
                                            WHERE record_genres.record_id = records.id AND genres.name = ?))
                GROUP BY records.id
                HAVING COUNT(record_ratings.rating) >= ?
                ORDER BY average DESC, count DESC, records.recordname
                LIMIT ? OFFSET ?`, [year, year, genre, genre, MIN_RATINGS, limit, offset]);
  },

  countRecords: (year, genre) => {
    return get(`SELECT COUNT(*) AS total
                FROM records
                WHERE (SELECT COUNT(*) FROM record_ratings WHERE record_ratings.record_id = records.id) >= ?
                  AND (? IS NULL OR substr(records.release_date, 1, 4) = ?)
                  AND (? IS NULL OR EXISTS (SELECT 1 FROM record_genres JOIN genres ON genres.id = record_genres.genre_id
                                            WHERE record_genres.record_id = records.id AND genres.name = ?))`, [MIN_RATINGS, year, year, genre, genre]);
  },

  getSongs: (year, genre, limit, offset) => {
    return all(`SELECT songs.id, songs.songname AS name, songs.image, records.image AS recordimage, records.recordname AS album, records.release_date,
                  artists.id AS artist_id, artists.artname,
                  ROUND(AVG(song_ratings.rating), 2) AS average, COUNT(song_ratings.rating) AS count
                FROM songs
                JOIN song_ratings ON song_ratings.song_id = songs.id
                LEFT JOIN records ON records.id = songs.recordid
                LEFT JOIN artists ON artists.id = records.artid
                WHERE (? IS NULL OR substr(records.release_date, 1, 4) = ?)
                  AND (? IS NULL OR EXISTS (SELECT 1 FROM song_genres JOIN genres ON genres.id = song_genres.genre_id
                                            WHERE song_genres.song_id = songs.id AND genres.name = ?))
                GROUP BY songs.id
                HAVING COUNT(song_ratings.rating) >= ?
                ORDER BY average DESC, count DESC, songs.songname
                LIMIT ? OFFSET ?`, [year, year, genre, genre, MIN_RATINGS, limit, offset]);
  },

  countSongs: (year, genre) => {
    return get(`SELECT COUNT(*) AS total
                FROM songs
                LEFT JOIN records ON records.id = songs.recordid
                WHERE (SELECT COUNT(*) FROM song_ratings WHERE song_ratings.song_id = songs.id) >= ?
                  AND (? IS NULL OR substr(records.release_date, 1, 4) = ?)
                  AND (? IS NULL OR EXISTS (SELECT 1 FROM song_genres JOIN genres ON genres.id = song_genres.genre_id
                                            WHERE song_genres.song_id = songs.id AND genres.name = ?))`, [MIN_RATINGS, year, year, genre, genre]);
  },

  getYears: () => {
    return all(`SELECT DISTINCT substr(release_date, 1, 4) AS year
                FROM records
                WHERE release_date IS NOT NULL AND release_date != ''
                ORDER BY year DESC`, []);
  }
};

module.exports = Chart;
