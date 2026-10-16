const Favourite = require("../models/favouriteModel");
const Artist = require("../models/artistModel");
const Record = require("../models/recordModel");
const Song = require("../models/songModel");

//artists

exports.getFavouriteArtists = async (req, res) => {
  try {
    const username = req.params.username;
    const artists = await Favourite.findArtists(username);

    res.json(artists);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.addFavouriteArtist = async (req, res) => {
  try {
    const username = req.user.username;
    const { artistId } = req.body;

    if (!artistId) {
      return res.status(400).json({ message: "Artist ID required" });
    }

    const artist = await Artist.findById(artistId);
    if (!artist) {
      return res.status(404).json({ message: "Artist not found" });
    }

    const favourites = await Favourite.findArtists(username);
    if (favourites.some(a => a.id === artistId)) {
      return res.status(400).json({ message: "Artist is already in your favourites" });
    }

    const result = await Favourite.addArtist(username, artistId);
    res.status(201).json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.removeFavouriteArtist = async (req, res) => {
  try {
    const username = req.user.username;
    const { artistId } = req.body;

    const favourites = await Favourite.findArtists(username);
    if (!favourites.some(a => a.id === artistId)) {
      return res.status(400).json({ message: "Artist is not in your favourites" });
    }

    const result = await Favourite.removeArtist(username, artistId);
    res.status(200).json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

//records

exports.getFavouriteRecords = async (req, res) => {
  try {
    const username = req.params.username;
    const records = await Favourite.findRecords(username);

    res.json(records);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.addFavouriteRecord = async (req, res) => {
  try {
    const username = req.user.username;
    const { recordId } = req.body;

    if (!recordId) {
      return res.status(400).json({ message: "Record ID required" });
    }

    const record = await Record.findById(recordId);
    if (!record) {
      return res.status(404).json({ message: "Record not found" });
    }

    const favourites = await Favourite.findRecords(username);
    if (favourites.some(r => r.id === recordId)) {
      return res.status(400).json({ message: "Record is already in your favourites" });
    }

    const result = await Favourite.addRecord(username, recordId);
    res.status(201).json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.removeFavouriteRecord = async (req, res) => {
  try {
    const username = req.user.username;
    const { recordId } = req.body;

    const favourites = await Favourite.findRecords(username);
    if (!favourites.some(r => r.id === recordId)) {
      return res.status(400).json({ message: "Record is not in your favourites" });
    }

    const result = await Favourite.removeRecord(username, recordId);
    res.status(200).json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

//songs

exports.getFavouriteSongs = async (req, res) => {
  try {
    const username = req.params.username;
    const songs = await Favourite.findSongs(username);

    res.json(songs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.addFavouriteSong = async (req, res) => {
  try {
    const username = req.user.username;
    const { songId } = req.body;

    if (!songId) {
      return res.status(400).json({ message: "Song ID required" });
    }

    const song = await Song.findById(songId);
    if (!song) {
      return res.status(404).json({ message: "Song not found" });
    }

    const favourites = await Favourite.findSongs(username);
    if (favourites.some(s => s.id === songId)) {
      return res.status(400).json({ message: "Song is already in your favourites" });
    }

    const result = await Favourite.addSong(username, songId);
    res.status(201).json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.removeFavouriteSong = async (req, res) => {
  try {
    const username = req.user.username;
    const { songId } = req.body;

    const favourites = await Favourite.findSongs(username);
    if (!favourites.some(s => s.id === songId)) {
      return res.status(400).json({ message: "Song is not in your favourites" });
    }

    const result = await Favourite.removeSong(username, songId);
    res.status(200).json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
