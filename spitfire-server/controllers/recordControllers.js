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
    const record = await Record.findById(recordid);

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

exports.getDiscoverRecords = async (req, res) => {
  try {
    const genre = req.params.genre;
    const era = req.params.era;
    const records = await Record.discoverRecords(genre, era);

    if (!records) {
      return res.status(404).json({ message: "No records found" });
    }
    
    res.json(records);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
