const sqlite3 = require("sqlite3").verbose();

const db = new sqlite3.Database("./database.sqlite",
(err) => {
if (err) console.error(err.message);
else console.log("Connected to SQLite DB");
});


// Creazione tabella utenti se non esiste
db.run(`
CREATE TABLE IF NOT EXISTS users (
username PRIMARY KEY,
email TEXT UNIQUE,
password TEXT
ruolo TEXT
)
`);


module.exports = db;