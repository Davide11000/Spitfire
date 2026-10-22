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
    genre TEXT,
    language TEXT,
    FOREIGN KEY (artid) REFERENCES artists(id)
  );

  CREATE TABLE IF NOT EXISTS songs (
    id INTEGER PRIMARY KEY,
    songname TEXT,
    recordid INTEGER,
    image TEXT,
    release_date TEXT,
    genre TEXT,
    language TEXT,
    lyrics TEXT,
    FOREIGN KEY (recordid) REFERENCES records(id)
  );

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

  -- Richieste di aggiunta fatte dagli utenti (type = song | record | artist)
  -- Le date sono salvate come testo "AAAA-MM-GG"
  -- Non tutti i campi servono per ogni tipo:
  --   song:   name, artist_name, album_name, release_date, genre, language, lyrics, image
  --   record: name, artist_name, release_date, genre, language, tracklist, image
  --   artist: name, birth_date, country, bio, image
  CREATE TABLE IF NOT EXISTS requests (
    id INTEGER PRIMARY KEY,
    username TEXT NOT NULL,
    type TEXT NOT NULL,
    name TEXT NOT NULL,
    artist_name TEXT,
    album_name TEXT,
    release_date TEXT,
    genre TEXT,
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
`, (err) => {
  if (err) console.error("Error creating tables:", err.message);
  else console.log("Tables ready");
});

module.exports = db;