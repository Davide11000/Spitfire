const Song = require("../models/songModel");


exports.create = async (req, res) => {
  try {
    const {songname, recordid} = req.body;
    
    if (!songname || !recordid) {
      return res.status(400).json({ message: "Name and recordid required"});
    }
    
    const song = await Song.create(songname, recordid);
    res.status(201).json(song);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }     
};

exports.getSongBySongname = async (req, res) => {
  try {
    const songname = req.params.songname;
    const song = await Song.findBysongname(songname);

    if (!song) {
      return res.status(404).json({ message: "No songs found with that name" });
    }

    res.json(song);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getSongByRecordID = async (req, res) => {
  try {
    const recordid = req.params.recordid;
    const song = await Song.findByrecordid(recordid);

    res.json(song);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getSongByID = async (req, res) => {
  try {
    const songid = req.params.id;
    const song = await Song.findById(songid);

    if (!song) {
      return res.status(404).json({ message: "Song not found" });
    }

    res.json(song);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

