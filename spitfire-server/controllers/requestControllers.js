const Request = require("../models/requestModel");

exports.create = async (req, res) => {
  try {
    const username = req.user.username;
    const { type, name, artistName, albumName, releaseDate, genre, language, lyrics, birthDate, country, bio, tracklist } = req.body;

    // L'immagine è obbligatoria: se c'è, multer l'ha già salvata in uploads/requests
    if (!req.file) {
      return res.status(400).json({ message: "Image is required" });
    }

    const image = "/uploads/requests/" + req.file.filename;

    if (!name) {
      return res.status(400).json({ message: "Name is required" });
    }

    if (type === "song") {
      if (!artistName || !albumName || !releaseDate || !genre || !language) {
        return res.status(400).json({ message: "Artist, album, release date, genre and language are required" });
      }

      // Il testo della canzone è facoltativo (es. brani strumentali)
      const result = await Request.createSong(username, name, artistName, albumName, releaseDate, genre, language, lyrics, image);
      return res.status(201).json(result);
    }

    if (type === "record") {
      if (!artistName || !releaseDate || !genre || !language || !tracklist) {
        return res.status(400).json({ message: "Artist, release date, genre, language and tracklist are required" });
      }

      const result = await Request.createRecord(username, name, artistName, releaseDate, genre, language, tracklist, image);
      return res.status(201).json(result);
    }

    if (type === "artist") {
      if (!birthDate || !country || !bio) {
        return res.status(400).json({ message: "Birth date, country and biography are required" });
      }

      const result = await Request.createArtist(username, name, birthDate, country, bio, image);
      return res.status(201).json(result);
    }

    res.status(400).json({ message: "Type must be song, record or artist" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getMyRequests = async (req, res) => {
  try {
    const username = req.user.username;
    const requests = await Request.findByUsername(username);

    res.json(requests);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
