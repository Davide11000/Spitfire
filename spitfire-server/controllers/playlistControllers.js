const Playlist = require("../models/playlistModel");
const fs = require("fs");

exports.create = async (req, res) => {
    try {
        const username = req.user.username;
        const { name } = req.body;

        if (!name) {
            return res.status(400).json({ message: "Playlist name is required"});
        }

        // I dati arrivano come form-data (per via dell'immagine), quindi isPublic è il testo "true" o "false".
        // Se manca, la playlist è pubblica
        let isPublic = true;
        if (req.body.isPublic === "false" || req.body.isPublic === false) {
            isPublic = false;
        }

        // La copertina è facoltativa: se c'è, multer l'ha già salvata in uploads/playlists
        let image = null;
        if (req.file) {
            image = "/uploads/playlists/" + req.file.filename;
        }

        const playlist = await Playlist.create(name, username, image, isPublic);

        res.status(201).json(playlist);
    }   catch (err) {
        res.status(500).json({ error: err.message });
    }     

};

exports.addSong = async (req, res) => {
  try {
    const username = req.user.username;
    const { playlistId, songId } = req.body;

    const playlist = await Playlist.findById(playlistId);

    if (!playlist) {
      return res.status(404).json({ message: "Playlist not found" });
    }

    if (playlist.username !== username) {
      return res.status(403).json({ message: "You are not the owner of this playlist" });
    }

    const songs = await Playlist.getSongs(playlistId);
    const alreadyInPlaylist = songs.some(s => s.id === songId);

    if (alreadyInPlaylist) {
      return res.status(400).json({ message: "Song is already in this playlist" });
    }

    const result = await Playlist.addSong(playlistId, songId);
    res.status(201).json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.removeSong = async (req, res) => {
  try {
    const username = req.user.username;
    const { playlistId, songId } = req.body;

    const playlist = await Playlist.findById(playlistId);

    if (!playlist) {
      return res.status(404).json({ message: "Playlist not found" });
    }

    if (playlist.username !== username) {
      return res.status(403).json({ message: "You are not the owner of this playlist" });
    }

    const songs = await Playlist.getSongs(playlistId);
    const alreadyInPlaylist = songs.some(s => s.id === songId);

    if (!alreadyInPlaylist) {
      return res.status(400).json({ message: "Song is not in this playlist" });
    }

    const result = await Playlist.removeSong(playlistId, songId);
    res.status(200).json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.setVisibility = async (req, res) => {
  try {
    const username = req.user.username;
    const playlistId = req.params.playlistId;
    const { isPublic } = req.body;

    if (typeof isPublic !== "boolean") {
      return res.status(400).json({ message: "isPublic must be true or false" });
    }

    const playlist = await Playlist.findById(playlistId);

    if (!playlist) {
      return res.status(404).json({ message: "Playlist not found" });
    }

    if (playlist.username !== username) {
      return res.status(403).json({ message: "You are not the owner of this playlist" });
    }

    const result = await Playlist.setVisibility(playlistId, isPublic);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.deletePlaylist = async (req, res) => {
  try {
    const username = req.user.username;
    const playlistId = req.params.playlistId;

    const playlist = await Playlist.findById(playlistId);

    if (!playlist) {
      return res.status(404).json({ message: "Playlist not found" });
    }

    if (playlist.username !== username) {
      return res.status(403).json({ message: "You are not the owner of this playlist" });
    }

    // Prima tolgo le canzoni (tabella playlist_songs), poi la playlist
    await Playlist.removeAllSongs(playlistId);
    const result = await Playlist.delete(playlistId);

    // Cancello dal disco la copertina, se c'era
    if (playlist.image) {
      fs.unlink("." + playlist.image, () => {});
    }

    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getSongs = async (req, res) => {
  try {
    const playlistId = req.params.playlistId; 

    const playlist = await Playlist.findById(playlistId);

    if (!playlist) {
      return res.status(404).json({ message: "Playlist not found" });
    }

    // Una playlist privata la può vedere solo il suo proprietario
    if (!playlist.is_public && (!req.user || req.user.username !== playlist.username)) {
      return res.status(403).json({ message: "This playlist is private" });
    }
    
    const songs = await Playlist.getSongs(playlistId);

    res.json(songs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getUserPlaylists = async (req, res) => {
  try {
    const username = req.params.username;
    let playlists;

    // Il proprietario vede tutte le sue playlist, gli altri solo quelle pubbliche
    if (req.user && req.user.username === username) {
      playlists = await Playlist.findByUsername(username);
    } else {
      playlists = await Playlist.findPublicByUsername(username);
    }

    res.json(playlists);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getPlaylistById = async (req, res) => {
  try {
    const playlistId = req.params.playlistId;
    const playlist = await Playlist.findById(playlistId);

    if (!playlist) {
      return res.status(404).json({ message: "Playlist not found" });
    }

    // Una playlist privata la può vedere solo il suo proprietario
    if (!playlist.is_public && (!req.user || req.user.username !== playlist.username)) {
      return res.status(403).json({ message: "This playlist is private" });
    }

    res.json(playlist);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};