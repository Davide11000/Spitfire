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
    ruolo TEXT DEFAULT 'utente'
  )

  CREATE TABLE IF NOT EXISTS artists (
    artname TEXT PRIMARY KEY,
    id INT(4) UNIQUE
  )
  
  CREATE TABLE IF NOT EXISTS records (
    recordname TEXT PRIMARY KEY,
    artid INT(4),
    id INT(4) UNIQUE
  )

  CREATE TABLE IF NOT EXISTS songs (
    songname TEXT PRIMARY KEY,
    recordid INT(4),
    id INT(4) UNIQUE
  )
`);


module.exports = db;