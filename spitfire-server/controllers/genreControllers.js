const Genre = require("../models/genreModel");
const Record = require("../models/recordModel");
const Song = require("../models/songModel");

exports.getAll = async (req, res) => {
  try {
    const genres = await Genre.findAll();
    res.json(genres);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ALBUM

exports.getRecordGenres = async (req, res) => {
  try {
    const recordId = req.params.recordId;
    const genres = await Genre.findByRecord(recordId);

    res.json(genres);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getGenreRecords = async (req, res) => {
  try {
    const genreId = req.params.genreId;
    const records = await Genre.findRecords(genreId);

    res.json(records);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.addGenreToRecord = async (req, res) => {
  try {
    const { recordId, genreId } = req.body;

    if (!recordId || !genreId) {
      return res.status(400).json({ message: "Record ID and genre ID required" });
    }

    const record = await Record.findById(recordId);
    if (!record) {
      return res.status(404).json({ message: "Record not found" });
    }

    const genre = await Genre.findById(genreId);
    if (!genre) {
      return res.status(404).json({ message: "Genre not found" });
    }

    const genres = await Genre.findByRecord(recordId);
    if (genres.some(g => g.id === genreId)) {
      return res.status(400).json({ message: "The record already has this genre" });
    }

    const result = await Genre.addToRecord(recordId, genreId);
    res.status(201).json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.removeGenreFromRecord = async (req, res) => {
  try {
    const { recordId, genreId } = req.body;

    const genres = await Genre.findByRecord(recordId);
    if (!genres.some(g => g.id === genreId)) {
      return res.status(400).json({ message: "The record doesn't have this genre" });
    }

    const result = await Genre.removeFromRecord(recordId, genreId);
    res.status(200).json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// CANZONI

exports.getSongGenres = async (req, res) => {
  try {
    const songId = req.params.songId;
    const genres = await Genre.findBySong(songId);

    res.json(genres);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getGenreSongs = async (req, res) => {
  try {
    const genreId = req.params.genreId;
    const songs = await Genre.findSongs(genreId);

    res.json(songs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.addGenreToSong = async (req, res) => {
  try {
    const { songId, genreId } = req.body;

    if (!songId || !genreId) {
      return res.status(400).json({ message: "Song ID and genre ID required" });
    }

    const song = await Song.findById(songId);
    if (!song) {
      return res.status(404).json({ message: "Song not found" });
    }

    const genre = await Genre.findById(genreId);
    if (!genre) {
      return res.status(404).json({ message: "Genre not found" });
    }

    const genres = await Genre.findBySong(songId);
    if (genres.some(g => g.id === genreId)) {
      return res.status(400).json({ message: "The song already has this genre" });
    }

    const result = await Genre.addToSong(songId, genreId);
    res.status(201).json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.removeGenreFromSong = async (req, res) => {
  try {
    const { songId, genreId } = req.body;

    const genres = await Genre.findBySong(songId);
    if (!genres.some(g => g.id === genreId)) {
      return res.status(400).json({ message: "The song doesn't have this genre" });
    }

    const result = await Genre.removeFromSong(songId, genreId);
    res.status(200).json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
