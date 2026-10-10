const sqlite3 = require("sqlite3").verbose();

const db = new sqlite3.Database("./database.sqlite",
(err) => {
  if (err) console.error(err.message);
  else console.log("Connected to SQLite DB");
});

// Creazione tabelle se non esistono
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    username TEXT PRIMARY KEY,
    email TEXT UNIQUE,
    password TEXT,
    ruolo TEXT DEFAULT 'utente',
    foto_profilo TEXT
  );

  CREATE TABLE IF NOT EXISTS artists (
    id INTEGER PRIMARY KEY,
    artname TEXT
  );

  CREATE TABLE IF NOT EXISTS records (
    id INTEGER PRIMARY KEY,
    recordname TEXT,
    artid INTEGER,
    FOREIGN KEY (artid) REFERENCES artists(id)
  );

  CREATE TABLE IF NOT EXISTS songs (
    id INTEGER PRIMARY KEY,
    songname TEXT,
    recordid INTEGER,
    FOREIGN KEY (recordid) REFERENCES records(id)
  );

  CREATE TABLE IF NOT EXISTS follows (
    follower TEXT NOT NULL,
    following TEXT NOT NULL,
    PRIMARY KEY (follower, following),
    FOREIGN KEY (follower) REFERENCES users(username),
    FOREIGN KEY (following) REFERENCES users(username)
  );

  CREATE TABLE IF NOT EXISTS favourite_artist (
    user TEXT NOT NULL,
    artid INTEGER,
    PRIMARY KEY (user, artid),
    FOREIGN KEY (user) REFERENCES users(username),
    FOREIGN KEY (artid) REFERENCES artists(id)
  );

  CREATE TABLE IF NOT EXISTS favourite_record (
    user TEXT NOT NULL,
    recordid INTEGER,
    PRIMARY KEY (user, recordid),
    FOREIGN KEY (user) REFERENCES users(username),
    FOREIGN KEY (recordid) REFERENCES records(id)
  );

  CREATE TABLE IF NOT EXISTS favourite_song (
    user TEXT NOT NULL,
    songid INTEGER,
    PRIMARY KEY (user, songid),
    FOREIGN KEY (user) REFERENCES users(username),
    FOREIGN KEY (songid) REFERENCES songs(id)
  );

  CREATE TABLE IF NOT EXISTS playlists (
    id INTEGER PRIMARY KEY,
    name TEXT NOT NULL,
    username TEXT NOT NULL,
    FOREIGN KEY (username) REFERENCES users(username)
  );

  CREATE TABLE IF NOT EXISTS playlist_songs (
    playlist_id INTEGER NOT NULL,
    song_id INTEGER NOT NULL,
    PRIMARY KEY (playlist_id, song_id),
    FOREIGN KEY (playlist_id) REFERENCES playlists(id),
    FOREIGN KEY (song_id) REFERENCES songs(id)
  );
`, (err) => {
  if (err) console.error("Error creating tables:", err.message);
  else console.log("Tables ready");
});

export default db;