const db = require("../db/db");

const Record = {
  create: (recordname, artid) => {
    return new Promise((resolve, reject) => {
      const query = `INSERT INTO records (recordname, artid) VALUES (?, ?)`;
      db.run(query, [recordname, artid], function (err) {
        if (err) reject(err);
        else resolve({ id: this.lastID,recordname, artid });
      });
    });
  },

  findByRecordname: (recordname) => {
    return new Promise((resolve, reject) => {
      const query = `SELECT * FROM records WHERE recordname = ?`;
      db.all(query, [recordname], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
  },

  findByArtid: (artid) => {
    return new Promise((resolve, reject) => {
      const query = `SELECT * FROM records WHERE artid = ?`;
      db.all(query, [artid], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
  },

  findById: (Id) => {
    return new Promise((resolve, reject) => {
      const query = `SELECT * FROM records WHERE id = ?`;
      db.get(query, [Id], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
  },
  
  getRecent: (Len) => {
    return new Promise((resolve, reject) => {
      const query = `SELECT * FROM records LIMIT ?`;
      db.all(query, [Len], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    })
  },

  getTopRated: (Len) => {
    return new Promise((resolve, reject) => {
      const query = `SELECT * FROM records ORDER BY rating DESC LIMIT ?`;
      db.all(query, [Len], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    })
  },

  findByGenre: (genre) => {
    return new Promise((resolve, reject) => {
      const query = `SELECT * FROM records WHERE genre = ?`
      db.all(query, [genre], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      })
    })
  },

  findByEra: (era) => {
    return new Promise((resolve, reject) => {
      const query = `SELECT * FROM records WHERE release_date = ?`;
      db.all(query, [era], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      })
    })
  },

  discoverRecords: (genre, era) => {
    return new Promise((resolve, reject) => {
      const query = `SELECT * from records WHERE release_date = ? AND genre = ?`;
      db.all(query, [genre, era], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      })
    })
  }
};

module.exports = Record;