const sqlite3 = require("sqlite3").verbose();

const db = new sqlite3.Database("./database.sqlite",
(err) => {
  if (err) console.error(err.message);
  else console.log("Connected to SQLite DB");
});

console.log("db.js");

// Creazione tabelle se non esistono
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    username TEXT PRIMARY KEY,
    email TEXT UNIQUE,
    password TEXT,
    ruolo TEXT DEFAULT 'utente',
    foto_profilo TEXT,
    bio TEXT,
    who_can_message TEXT NOT NULL DEFAULT 'everyone'
  );

  CREATE TABLE IF NOT EXISTS artists (
    id INTEGER PRIMARY KEY,
    artname TEXT,
    image TEXT,
    birth_date DATE,
    country TEXT,
    bio TEXT
  );

  INSERT OR IGNORE INTO artists VALUES (0, 'Nick Drake', '', '1948-06-19', 'Rangoon', '');

  CREATE TABLE IF NOT EXISTS records (
    id INTEGER PRIMARY KEY,
    recordname TEXT,
    artid INTEGER,
    image TEXT,
    release_date DATE,
    language TEXT,
    rating NUMERIC DEFAULT 0,
    FOREIGN KEY (artid) REFERENCES artists(id)
  );

  INSERT OR IGNORE INTO records VALUES (0, 'Pink Moon', 0, '', '1972-02-25', 'English', 0);

  CREATE TABLE IF NOT EXISTS songs (
    id INTEGER PRIMARY KEY,
    songname TEXT,
    duration TIME,
    recordid INTEGER,
    artid INTEGER,
    image TEXT,
    release_date DATE,
    language TEXT,
    lyrics TEXT,
    rating NUMERIC DEFAULT 0,
    FOREIGN KEY (recordid) REFERENCES records(id)
  );

  INSERT OR IGNORE INTO songs VALUES (0, 'test', '00-00-00', 0, 0, '', '1972-02-25', 'English', '', 0);
  INSERT OR IGNORE INTO songs VALUES (1, 'test2', '00-00-00', 0, 0, '', '1972-02-25', 'English', '', 0);

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
    description TEXT,
    is_public INTEGER NOT NULL DEFAULT 1,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (username) REFERENCES users(username)
  );

  CREATE TABLE IF NOT EXISTS playlist_likes (
    playlist_id INTEGER NOT NULL,
    username TEXT NOT NULL,
    PRIMARY KEY (playlist_id, username),
    FOREIGN KEY (playlist_id) REFERENCES playlists(id),
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

  CREATE TABLE IF NOT EXISTS comments (
    id INTEGER PRIMARY KEY,
    username TEXT,
    target_type TEXT NOT NULL,
    target_id INTEGER NOT NULL,
    parent_id INTEGER,
    text TEXT NOT NULL,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (username) REFERENCES users(username),
    FOREIGN KEY (parent_id) REFERENCES comments(id)
  );

  CREATE TABLE IF NOT EXISTS comment_likes (
    comment_id INTEGER NOT NULL,
    username TEXT NOT NULL,
    PRIMARY KEY (comment_id, username),
    FOREIGN KEY (comment_id) REFERENCES comments(id),
    FOREIGN KEY (username) REFERENCES users(username)
  );

  CREATE TABLE IF NOT EXISTS comment_reports (
    id INTEGER PRIMARY KEY,
    comment_id INTEGER NOT NULL,
    username TEXT NOT NULL,
    reason TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending',
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (comment_id) REFERENCES comments(id),
    FOREIGN KEY (username) REFERENCES users(username)
  );

  CREATE TABLE IF NOT EXISTS messages (
    id INTEGER PRIMARY KEY,
    sender TEXT NOT NULL,
    receiver TEXT NOT NULL,
    text TEXT NOT NULL,
    is_read INTEGER NOT NULL DEFAULT 0,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (sender) REFERENCES users(username),
    FOREIGN KEY (receiver) REFERENCES users(username)
  );

  CREATE TABLE IF NOT EXISTS notifications (
    id INTEGER PRIMARY KEY,
    username TEXT NOT NULL,
    type TEXT NOT NULL,
    from_user TEXT NOT NULL,
    comment_id INTEGER,
    playlist_id INTEGER,
    text TEXT,
    is_read INTEGER NOT NULL DEFAULT 0,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (username) REFERENCES users(username),
    FOREIGN KEY (from_user) REFERENCES users(username),
    FOREIGN KEY (comment_id) REFERENCES comments(id),
    FOREIGN KEY (playlist_id) REFERENCES playlists(id)
  );
`, (err) => {
  if (err) console.error("Error creating tables:", err.message);
  else console.log("Tables ready");
});

module.exports = db;