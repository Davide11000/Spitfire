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
    artname TEXT,
    image TEXT,
    birth_date TEXT,
    country TEXT,
    bio TEXT
  );

  CREATE TABLE IF NOT EXISTS records (
    id INTEGER PRIMARY KEY,
    recordname TEXT,
    artid INTEGER,
    image TEXT,
    release_date TEXT,
    language TEXT,
    rating NUMERIC DEFAULT 0,
    FOREIGN KEY (artid) REFERENCES artists(id)
  );

  CREATE TABLE IF NOT EXISTS songs (
    id INTEGER PRIMARY KEY,
    songname TEXT,
    recordid INTEGER,
    image TEXT,
    release_date TEXT,
    language TEXT,
    lyrics TEXT,
    rating NUMERIC DEFAULT 0,
    FOREIGN KEY (recordid) REFERENCES records(id)
  );

  CREATE TABLE IF NOT EXISTS genres (
    id INTEGER PRIMARY KEY,
    name TEXT NOT NULL UNIQUE
  );

  CREATE TABLE IF NOT EXISTS record_genres (
    record_id INTEGER NOT NULL,
    genre_id INTEGER NOT NULL,
    PRIMARY KEY (record_id, genre_id),
    FOREIGN KEY (record_id) REFERENCES records(id),
    FOREIGN KEY (genre_id) REFERENCES genres(id)
  );

  CREATE TABLE IF NOT EXISTS song_genres (
    song_id INTEGER NOT NULL,
    genre_id INTEGER NOT NULL,
    PRIMARY KEY (song_id, genre_id),
    FOREIGN KEY (song_id) REFERENCES songs(id),
    FOREIGN KEY (genre_id) REFERENCES genres(id)
  );

  -- Generi che sto aggiungendo manualmente poi si valutano
  INSERT OR IGNORE INTO genres (name) VALUES
    ('Pop'), ('Rock'), ('Hip-Hop'), ('Rap'), ('Soul'), ('Funk'), ('Jazz'), ('Blues'),
    ('Electronic'), ('Dance'), ('Metal'), ('Punk'), ('Indie'), ('Folk'), ('Country'), ('Reggae');

  CREATE TABLE IF NOT EXISTS follows (
    follower TEXT NOT NULL,
    following TEXT NOT NULL,
    PRIMARY KEY (follower, following),
    FOREIGN KEY (follower) REFERENCES users(username),
    FOREIGN KEY (following) REFERENCES users(username)
  );

  CREATE TABLE IF NOT EXISTS playlists (
    id INTEGER PRIMARY KEY,
    name TEXT NOT NULL,
    username TEXT NOT NULL,
    image TEXT,
    is_public INTEGER NOT NULL DEFAULT 1,
    FOREIGN KEY (username) REFERENCES users(username)
  );

  CREATE TABLE IF NOT EXISTS playlist_songs (
    playlist_id INTEGER NOT NULL,
    song_id INTEGER NOT NULL,
    PRIMARY KEY (playlist_id, song_id),
    FOREIGN KEY (playlist_id) REFERENCES playlists(id),
    FOREIGN KEY (song_id) REFERENCES songs(id)
  );

  CREATE TABLE IF NOT EXISTS favourite_artists (
    username TEXT NOT NULL,
    artist_id INTEGER NOT NULL,
    PRIMARY KEY (username, artist_id),
    FOREIGN KEY (username) REFERENCES users(username),
    FOREIGN KEY (artist_id) REFERENCES artists(id)
  );

  CREATE TABLE IF NOT EXISTS favourite_songs (
    username TEXT NOT NULL,
    song_id INTEGER NOT NULL,
    PRIMARY KEY (username, song_id),
    FOREIGN KEY (username) REFERENCES users(username),
    FOREIGN KEY (song_id) REFERENCES songs(id)
  );

  CREATE TABLE IF NOT EXISTS favourite_records (
    username TEXT NOT NULL,
    record_id INTEGER NOT NULL,
    PRIMARY KEY (username, record_id),
    FOREIGN KEY (username) REFERENCES users(username),
    FOREIGN KEY (record_id) REFERENCES records(id)
  );

  CREATE TABLE IF NOT EXISTS requests (
    id INTEGER PRIMARY KEY,
    username TEXT NOT NULL,
    type TEXT NOT NULL,
    name TEXT NOT NULL,
    artist_name TEXT,
    album_name TEXT,
    release_date TEXT,
    genres TEXT,
    language TEXT,
    lyrics TEXT,
    birth_date TEXT,
    country TEXT,
    bio TEXT,
    tracklist TEXT,
    image TEXT,
    status TEXT NOT NULL DEFAULT 'pending',
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (username) REFERENCES users(username)
  );

  CREATE TABLE IF NOT EXISTS lyrics (
    language TEXT NOT NULL,
    lyrics TEXT NOT NULL,
    songid INTEGER NOT NULL,
    PRIMARY KEY (language, songid),
    FOREIGN KEY (songid) REFERENCES songs(id)
  );

  CREATE TABLE IF NOT EXISTS song_ratings (
    song_id INTEGER NOT NULL,
    rating DECIMAL(1, 2),
    total_ratings INTEGER,
    PRIMARY KEY (song_id, rating),
    FOREIGN KEY (song_id) REFERENCES songs(id)
  );

  CREATE TABLE IF NOT EXISTS record_ratings (
    record_id INTEGER NOT NULL,
    rating DECIMAL(1, 2),
    total_ratings INTEGER,
    PRIMARY KEY (record_id, rating),
    FOREIGN KEY (record_id) REFERENCES records(id)
  );
`, (err) => {
  if (err) console.error("Error creating tables:", err.message);
  else console.log("Tables ready");
});

module.exports = db;