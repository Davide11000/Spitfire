const Record = require("../models/recordModel");
const Genre = require("../models/genreModel");

exports.getRecordByName = async (req, res) => {
  try {
    const recordname = req.params.recordname;
    const record = await Record.findByRecordname(recordname);

    if (!record.length) {
      return res.status(404).json({ message: "No record found with that name" });
    }
    res.json(record);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.create = async (req, res) => {
  try {
    const { recordname, artId, image, releaseDate, language, genreIds } = req.body;

    if (!recordname || !artId) {
      return res.status(400).json({ message: "Record name and artist ID required"});
    }

    const record = await Record.create(recordname, artId, image, releaseDate, language);

    // genreIds è un elenco di id dei generi, es. [2, 3]: per ognuno creo il collegamento
    if (genreIds) {
      for (const genreId of genreIds) {
        await Genre.addToRecord(record.id, genreId);
      }
    }

    record.genres = await Genre.findByRecord(record.id);
    res.status(201).json(record);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }     
};

exports.getRecordByArtID = async (req, res) => {
  try {
    const artid = req.params.artid;
    const record = await Record.findByArtid(artid);

    if (!record.length) {
      return res.status(404).json({ message: "No records exist with this Artist ID" });
    }

    res.json(record);
  }
  catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getRecordByID = async (req, res) => {
  try {
    const recordid = req.params.id;
    const record = await Record.findDetails(recordid);

    if (!record) {
      return res.status(404).json({ message: "No records exist with this ID" });
    }

    res.json(record);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.search = async (req, res) => {
  try {
    const text = req.query.q;

    if (!text) {
      return res.json([]);
    }

    const records = await Record.search(text);
    res.json(records);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getRecentRecords = async (req, res) => {
  try {
    const len = req.params.len;
    const records = await Record.getRecent(len);

    if (!records) {
      return res.status(404).json({ message: "No records found" });
    }

    res.json(records);
  } catch (err) {
    res.status(500).json({ error: err.message }); 
  }
};

exports.getTopRecords = async (req, res) => {
  try {
    const len = req.params.len;
    const records = await Record.getTopRated(len);

    if (!records) {
      return res.status(404).json({ message: "No records found" });
    }

    res.json(records);
  } catch (err) {
    res.status(500).json({ error: err.message }); 
  }
};

// Discover: consiglia 5 album in base a generi, epoche (decenni) e lingue scelte.
// Ogni album riceve un punteggio: +3 per ogni genere in comune, +2 se è dell'epoca giusta, +1 se è nella lingua giusta.
// Servono almeno un genere in comune; a parità di punteggio vince l'album con il voto medio più alto.
exports.getDiscoverRecords = async (req, res) => {
  try {
    const split = (value) => (value || "").split(",").map(v => v.trim()).filter(v => v);
    const genres = split(req.query.genres);
    const eras = split(req.query.eras).map(Number).filter(e => e);
    const langs = split(req.query.langs);

    if (genres.length === 0) {
      return res.status(400).json({ message: "Choose at least one genre" });
    }

    const records = await Record.findAllWithGenres();
    const results = [];

    for (const r of records) {
      const recordGenres = (r.genres || "").split(",");
      const genreMatches = genres.filter(g => recordGenres.includes(g)).length;
      if (genreMatches === 0) continue;

      const year = Number((r.release_date || "").substring(0, 4));
      const eraMatch = eras.some(e => year >= e && year <= e + 9);
      const langMatch = langs.includes(r.language);

      r.score = genreMatches * 3 + (eraMatch ? 2 : 0) + (langMatch ? 1 : 0);
      r.genres = recordGenres;
      results.push(r);
    }

    results.sort((a, b) => b.score - a.score || b.average - a.average);
    res.json(results.slice(0, 5));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Le lingue degli album presenti nel database (per le scelte di Discover)
exports.getLanguages = async (req, res) => {
  try {
    const rows = await Record.findLanguages();
    res.json(rows.map(r => r.language));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
