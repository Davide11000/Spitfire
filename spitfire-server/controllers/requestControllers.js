const Request = require("../models/requestModel");
const Artist = require("../models/artistModel");
const Record = require("../models/recordModel");
const Song = require("../models/songModel");
const Genre = require("../models/genreModel");
const Notification = require("../models/notificationModel");
const User = require("../models/userModel");
const Contribution = require("../models/contributionModel");
const Lyrics = require("../models/lyricsModel");

async function notifyAdmins(username, name, type) {
  const admins = await User.findAdmins();

  for (const admin of admins) {
    if (admin.username !== username) {
      await Notification.create(admin.username, type, username, null, name);
    }
  }
}

async function findEntity(type, id) {
  if (type === "song") return await Song.findById(id);
  if (type === "record") return await Record.findById(id);
  if (type === "artist") return await Artist.findById(id);
  return null;
}

function getEntityName(type, entity) {
  if (type === "song") return entity.songname;
  if (type === "record") return entity.recordname;
  return entity.artname;
}

// L'admin non passa per le richieste: quello che invia viene applicato subito
async function sendOrApply(req, res, result, name, notificationType) {
  if (req.user.ruolo === "admin") {
    const request = await Request.findById(result.id);
    const created = await applyRequest(request);
    if (!created) {
      return res.status(404).json({ message: "The page to correct no longer exists" });
    }
    return res.status(201).json({ ...result, status: "accepted", created });
  }

  await notifyAdmins(req.user.username, name, notificationType);
  res.status(201).json(result);
}

exports.create = async (req, res) => {
  try {
    const username = req.user.username;
    const { type, targetId, name, artistName, albumName, releaseDate, genres, language, lyrics, birthDate, country, bio, tracklist, duration } = req.body;
    // È una correzione se c'è targetId (anche 0 è un id valido)
    const isCorrection = targetId !== undefined && targetId !== "";

    if (type === "translation") {
      const song = await Song.findById(targetId);
      if (!song) {
        return res.status(404).json({ message: "Song not found" });
      }

      if (!language || !lyrics || !lyrics.trim()) {
        return res.status(400).json({ message: "Language and translated lyrics are required" });
      }

      if (language === song.language) {
        return res.status(400).json({ message: "This is the original language of the song" });
      }

      const result = await Request.create(username, "translation", song.id, {
        name: song.songname, language, lyrics: lyrics.trim()
      });

      return await sendOrApply(req, res, result, song.songname + " (" + language + ")", "new_translation");
    }

    if (type !== "song" && type !== "record" && type !== "artist") {
      return res.status(400).json({ message: "Type must be song, record or artist" });
    }

    if (!name || !name.trim()) {
      return res.status(400).json({ message: "The title is required" });
    }

    if (duration && !/^[0-9]{1,3}:[0-5][0-9]$/.test(duration)) {
      return res.status(400).json({ message: "The duration must be written as m:ss, e.g. 6:53" });
    }

    let image = null;
    if (req.file) {
      image = "/uploads/requests/" + req.file.filename;
    }

    if (isCorrection) {
      const entity = await findEntity(type, targetId);
      if (!entity) {
        return res.status(404).json({ message: "The page you want to correct does not exist" });
      }

      const changed = name.trim() !== getEntityName(type, entity) || image || releaseDate || genres || language ||
                      lyrics || birthDate || country || bio || tracklist || duration;
      if (!changed) {
        return res.status(400).json({ message: "Change at least one field" });
      }
    } else {
      if ((type === "song" || type === "record") && !artistName) {
        return res.status(400).json({ message: "The artist is required" });
      }

      if (type === "song" && !albumName) {
        return res.status(400).json({ message: "The album is required" });
      }
    }

    const result = await Request.create(username, type, isCorrection ? targetId : null, {
      name: name.trim(),
      artistName: artistName || null,
      albumName: albumName || null,
      releaseDate: releaseDate || null,
      genres: genres || null,
      language: language || null,
      lyrics: lyrics || null,
      birthDate: birthDate || null,
      country: country || null,
      bio: bio || null,
      tracklist: tracklist || null,
      duration: duration || null,
      image
    });

    await sendOrApply(req, res, result, name.trim(), isCorrection ? "new_correction" : "new_request");
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

async function notifyRequester(request, type, admin) {
  if (request.username !== admin) {
    await Notification.create(request.username, type, admin, null, request.name);
  }
}

async function getGenreIds(genres) {
  const ids = [];
  if (!genres) return ids;

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

async function replaceRecordGenres(recordId, genreIds) {
  await Genre.removeAllFromRecord(recordId);
  await addRecordGenres(recordId, genreIds);
}

async function replaceSongGenres(songId, genreIds) {
  await Genre.removeAllFromSong(songId);
  await addSongGenres(songId, genreIds);
}

async function addTracks(recordId, tracklist, language, genreIds, username) {
  if (!tracklist) return;

  const songs = await Song.findByrecordid(recordId);

  for (const songname of tracklist.split("\n")) {
    if (!songname.trim()) continue;
    if (songs.some(s => s.songname.toLowerCase() === songname.trim().toLowerCase())) continue;

    const song = await Song.create(songname.trim(), recordId, null, language, null);
    await Contribution.add("song", song.id, username);
    await addSongGenres(song.id, genreIds);
  }
}

async function applyCorrection(request) {
  const entity = await findEntity(request.type, request.target_id);
  if (!entity) return null;

  const genreIds = await getGenreIds(request.genres);

  if (request.type === "artist") {
    return await Artist.correct(entity.id, request.name, request.image || entity.image, request.birth_date || entity.birth_date,
                                request.country || entity.country, request.bio || entity.bio);
  }

  if (request.type === "record") {
    const record = await Record.correct(entity.id, request.name, request.image || entity.image,
                                        request.release_date || entity.release_date, request.language || entity.language);
    if (request.genres) await replaceRecordGenres(entity.id, genreIds);

    const recordGenres = await Genre.findByRecord(entity.id);
    await addTracks(entity.id, request.tracklist, record.language, recordGenres.map(g => g.id), request.username);
    return record;
  }

  const song = await Song.correct(entity.id, request.name, request.image || entity.image,
                                  request.language || entity.language, request.lyrics || entity.lyrics, request.duration || entity.duration);
  if (request.genres) await replaceSongGenres(entity.id, genreIds);
  return song;
}

// Applica una richiesta: crea o corregge la canzone/album/artista o salva la traduzione.
// Restituisce l'elemento creato/modificato, oppure null se la pagina da correggere non esiste più
async function applyRequest(request) {
  let created;

    if (request.type === "translation") {
      const translations = await Lyrics.findBySongId(request.target_id);

      if (translations.some(t => t.language === request.language)) {
        await Lyrics.update(request.target_id, request.language, request.lyrics);
      } else {
        await Lyrics.create(request.target_id, request.language, request.lyrics);
      }
      created = { id: request.target_id };
    }

    if (request.target_id !== null && request.type !== "translation") {
      created = await applyCorrection(request);
      if (!created) return null;
    }

    if (request.target_id === null && request.type === "artist") {
      const artists = await Artist.findByArtname(request.name);

      if (artists[0]) {
        const a = artists[0];
        created = await Artist.update(a.id, request.image || a.image, request.birth_date || a.birth_date, request.country || a.country, request.bio || a.bio);
      } else {
        created = await Artist.create(request.name, request.image, request.birth_date, request.country, request.bio);
      }
    }

    if (request.target_id === null && request.type === "record") {
      const artist = await findOrCreateArtist(request.artist_name);
      const genreIds = await getGenreIds(request.genres);

      const existing = await findRecord(artist.id, request.name);
      if (existing) {
        created = await Record.update(existing.id, request.image || existing.image, request.release_date || existing.release_date, request.language || existing.language);
      } else {
        created = await Record.create(request.name, artist.id, request.image, request.release_date, request.language);
      }

      await addRecordGenres(created.id, genreIds);
      await addTracks(created.id, request.tracklist, request.language, genreIds, request.username);
    }

    if (request.target_id === null && request.type === "song") {
      const artist = await findOrCreateArtist(request.artist_name);
      const genreIds = await getGenreIds(request.genres);

      let record = await findRecord(artist.id, request.album_name);
      if (!record) {
        record = await Record.create(request.album_name, artist.id, request.image, request.release_date, request.language);
        await addRecordGenres(record.id, genreIds);
        await Contribution.add("record", record.id, request.username);
      }

      const songs = await Song.findByrecordid(record.id);
      const existing = songs.find(s => s.songname.toLowerCase() === request.name.toLowerCase());

      if (existing) {
        created = await Song.update(existing.id, request.image || existing.image,
                                    request.language || existing.language, request.lyrics || existing.lyrics);
      } else {
        created = await Song.create(request.name, record.id, request.image, request.language, request.lyrics);
      }

      if (request.duration) await Song.setDuration(created.id, request.duration);
      await addSongGenres(created.id, genreIds);
    }

  await Contribution.add(request.type === "translation" ? "song" : request.type, created.id, request.username);
  await Request.setStatus(request.id, "accepted");
  return created;
}

exports.accept = async (req, res) => {
  try {
    const request = await Request.findById(req.params.id);

    if (!request || request.status !== "pending") {
      return res.status(404).json({ message: "Request not found" });
    }

    const created = await applyRequest(request);
    if (!created) {
      return res.status(404).json({ message: "The page to correct no longer exists" });
    }

    if (request.username !== req.user.username) {
      const contentType = request.type === "translation" ? "song" : request.type;
      await Notification.createForContent(request.username, "request_accepted", req.user.username, contentType, created.id, request.name);
    }
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
    await notifyRequester(request, "request_rejected", req.user.username);
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
