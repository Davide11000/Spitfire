const Record = require("../models/recordModel");

exports.getRecordByName = async (req, res) => {
  try {
    const recordname = req.params.recordName;
    const record = await Record.findByRecordname(recordname);

    if (!record) {
      return res.status(404).json({ message: "No record found with that name" });
    }
    res.json(record);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.create = async (req, res) => {
  try {
    const { recordname, artId } = req.body;

    if (!recordname || !artId) {
      return res.status(400).json({ message: "Record name and artist ID required"});
    }

    const record = await Record.create(recordname, artId);
      res.status(201).json(record);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }     
};

exports.getRecordByArtID = async (req, res) => {
  try {
    const artid = req.params.id;
    const record = await Record.findByArtid(artid);

    if (!record) {
      return res.status(404).json({ message: "No records exist with this Artist ID" });
    }

    res.json(record);
  }
  catch (err) {
    res.status(500).json({ error: err.message });
  }
}

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