const Request = require("../models/requestModel");
const Artist = require("../models/artistModel");
const Record = require("../models/recordModel");
const Song = require("../models/songModel");
const Genre = require("../models/genreModel");

exports.create = async (req, res) => {
  try {
    const username = req.user.username;
    const { type, name, artistName, albumName, releaseDate, genres, language, lyrics, birthDate, country, bio, tracklist } = req.body;

    // L'immagine è obbligatoria: se c'è, multer l'ha già salvata in uploads/requests
    if (!req.file) {
      return res.status(400).json({ message: "Image is required" });
    }

    const image = "/uploads/requests/" + req.file.filename;

    if (!name) {
      return res.status(400).json({ message: "Name is required" });
    }

    if (type === "song") {
      if (!artistName || !albumName || !releaseDate || !genres || !language) {
        return res.status(400).json({ message: "Artist, album, release date, genres and language are required" });
      }

      // Il testo della canzone è facoltativo (es. brani strumentali)
      const result = await Request.createSong(username, name, artistName, albumName, releaseDate, genres, language, lyrics, image);
      return res.status(201).json(result);
    }

    if (type === "record") {
      if (!artistName || !releaseDate || !genres || !language || !tracklist) {
        return res.status(400).json({ message: "Artist, release date, genres, language and tracklist are required" });
      }

      const result = await Request.createRecord(username, name, artistName, releaseDate, genres, language, tracklist, image);
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

exports.getPendingRequests = async (req, res) => {
  try {
    const requests = await Request.findPending();
    res.json(requests);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

async function getGenreIds(genres) {
  const ids = [];

  for (const name of genres.split(",")) {
    const genre = await Genre.findByName(name.trim());
    if (genre) ids.push(genre.id);
  }

  return ids;
}

async function findOrCreateArtist(artistName) {
  const artists = await Artist.findByArtname(artistName);
  if (artists[0]) return artists[0];

  return await Artist.create(artistName, null, null, null, null);
}

async function findRecord(artistId, recordName) {
  const records = await Record.findByArtid(artistId);
  return records.find(r => r.recordname.toLowerCase() === recordName.toLowerCase());
}

async function addRecordGenres(recordId, genreIds) {
  const oldGenres = await Genre.findByRecord(recordId);

  for (const genreId of genreIds) {
    if (!oldGenres.some(g => g.id === genreId)) {
      await Genre.addToRecord(recordId, genreId);
    }
  }
}

async function addSongGenres(songId, genreIds) {
  const oldGenres = await Genre.findBySong(songId);

  for (const genreId of genreIds) {
    if (!oldGenres.some(g => g.id === genreId)) {
      await Genre.addToSong(songId, genreId);
    }
  }
}

exports.accept = async (req, res) => {
  try {
    const request = await Request.findById(req.params.id);

    if (!request || request.status !== "pending") {
      return res.status(404).json({ message: "Request not found" });
    }

    let created;

    if (request.type === "artist") {
      const artists = await Artist.findByArtname(request.name);

      if (artists[0]) {
        created = await Artist.update(artists[0].id, request.image, request.birth_date, request.country, request.bio);
      } else {
        created = await Artist.create(request.name, request.image, request.birth_date, request.country, request.bio);
      }
    }

    if (request.type === "record") {
      const artist = await findOrCreateArtist(request.artist_name);
      const genreIds = await getGenreIds(request.genres);

      const existing = await findRecord(artist.id, request.name);
      if (existing) {
        created = await Record.update(existing.id, request.image, request.release_date, request.language);
      } else {
        created = await Record.create(request.name, artist.id, request.image, request.release_date, request.language);
      }

      await addRecordGenres(created.id, genreIds);

      const songs = await Song.findByrecordid(created.id);

      for (const songname of request.tracklist.split("\n")) {
        if (!songname.trim()) continue;
        if (songs.some(s => s.songname.toLowerCase() === songname.trim().toLowerCase())) continue;

        const song = await Song.create(songname.trim(), created.id, null, request.release_date, request.language, null);
        await addSongGenres(song.id, genreIds);
      }
    }

    if (request.type === "song") {
      const artist = await findOrCreateArtist(request.artist_name);
      const genreIds = await getGenreIds(request.genres);

      let record = await findRecord(artist.id, request.album_name);
      if (!record) {
        record = await Record.create(request.album_name, artist.id, request.image, request.release_date, request.language);
        await addRecordGenres(record.id, genreIds);
      }

      const songs = await Song.findByrecordid(record.id);
      const existing = songs.find(s => s.songname.toLowerCase() === request.name.toLowerCase());

      if (existing) {
        created = await Song.update(existing.id, request.image, request.release_date, request.language, request.lyrics);
      } else {
        created = await Song.create(request.name, record.id, request.image, request.release_date, request.language, request.lyrics);
      }

      await addSongGenres(created.id, genreIds);
    }

    await Request.setStatus(request.id, "accepted");
    res.json({ id: request.id, status: "accepted", type: request.type, created });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.reject = async (req, res) => {
  try {
    const request = await Request.findById(req.params.id);

    if (!request || request.status !== "pending") {
      return res.status(404).json({ message: "Request not found" });
    }

    const result = await Request.setStatus(request.id, "rejected");
    res.json(result);
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
