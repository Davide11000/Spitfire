const sqlite3 = require("sqlite3").verbose();

const db = new sqlite3.Database("./database.sqlite",
(err) => {
if (err) console.error(err.message);
else console.log("Connected to SQLite DB");
});


// Creazione tabelle se non esistono
db.run(`
  CREATE TABLE IF NOT EXISTS users (
    username TEXT PRIMARY KEY,
    email TEXT UNIQUE,
    password TEXT,
    ruolo TEXT DEFAULT 'utente',
    foto_profilo TEXT
  )

  CREATE TABLE IF NOT EXISTS artists (
    artname TEXT,
    id INTEGER PRIMARY KEY UNIQUE
  )
  
  CREATE TABLE IF NOT EXISTS records (
    recordname TEXT,
    artid INTEGER,
    id INTEGER PRIMARY KEY UNIQUE
  )

  CREATE TABLE IF NOT EXISTS songs (
    songname TEXT,
    recordid INTEGER,
    id INTEGER PRIMARY KEY UNIQUE
  )
`);

db.run(`
  CREATE TABLE IF NOT EXISTS follows (
    follower TEXT NOT NULL,
    following TEXT NOT NULL,
    PRIMARY KEY (follower, following),
    FOREIGN KEY (follower) REFERENCES users(username),
    FOREIGN KEY (following) REFERENCES users(username)
  )
`);

module.exports = db;