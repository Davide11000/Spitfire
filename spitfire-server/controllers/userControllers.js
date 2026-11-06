const User = require("../models/userModel");
const fs = require("fs");
const bcrypt = require("bcrypt");
const Playlist = require("../models/playlistModel");
const Request = require("../models/requestModel");
const Comment = require("../models/commentModel");
const Notification = require("../models/notificationModel");

exports.create = async (req, res) => {
  try {
    const {username, email, password} = req.body;
    
    if (!username || !email || !password) {
      return res.status(400).json({ message: "Creating a new user requires a username, a email and a password"});
    }
    
    const user = await User.create(username, email, password);
    res.status(201).json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }     
};

exports.getUserByUsername = async (req, res) => {
  try {
    const username = req.params.username;
    const user = await User.findByUsername(username);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const { password, email, ...safeUser } = user;

    if (req.user && req.user.username === username) {
      safeUser.email = email;
    }

    res.json(safeUser);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getUserByEmail = async (req, res) => {
  try {
    const email = req.params.email;
    const user = await User.findByEmail(email);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const { password, ...safeUser } = user;
    res.json(safeUser);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.uploadPhoto = async (req, res) => {
  try {
    const username = req.user.username;

    if (!req.file) {
      return res.status(400).json({ message: "No image uploaded" });
    }

    const user = await User.findByUsername(username);
    const photo = "/uploads/profiles/" + req.file.filename;

    const result = await User.updatePhoto(username, photo);

    // Cancello dal disco la foto vecchia, se c'era
    if (user.foto_profilo) {
      fs.unlink("." + user.foto_profilo, () => {});
    }

    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.removePhoto = async (req, res) => {
  try {
    const username = req.user.username;
    const user = await User.findByUsername(username);

    if (!user.foto_profilo) {
      return res.status(400).json({ message: "You have no profile photo" });
    }

    const result = await User.updatePhoto(username, null);
    fs.unlink("." + user.foto_profilo, () => {});

    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateBio = async (req, res) => {
  try {
    const { bio } = req.body;

    if (typeof bio !== "string" || bio.length > 300) {
      return res.status(400).json({ message: "The bio can have at most 300 characters" });
    }

    const result = await User.updateBio(req.user.username, bio.trim() || null);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateWhoCanMessage = async (req, res) => {
  try {
    const { whoCanMessage } = req.body;

    if (whoCanMessage !== "everyone" && whoCanMessage !== "following" && whoCanMessage !== "nobody") {
      return res.status(400).json({ message: "Invalid choice" });
    }

    const result = await User.updateWhoCanMessage(req.user.username, whoCanMessage);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.deleteAccount = async (req, res) => {
  try {
    const username = req.user.username;
    const { password } = req.body;

    if (!password) {
      return res.status(400).json({ message: "Password is required" });
    }

    const user = await User.findByUsername(username);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Password is wrong" });
    }

    const playlists = await Playlist.findByUsername(username);
    for (const playlist of playlists) {
      await Playlist.removeAllSongs(playlist.id);
      await Playlist.removeAllLikes(playlist.id);
      await Notification.removeByPlaylist(playlist.id);
      await Comment.removeByTarget("playlist", playlist.id);
      await Playlist.delete(playlist.id);

      if (playlist.image) {
        fs.unlink("." + playlist.image, () => {});
      }
    }

    const requests = await Request.findByUsername(username);
    await User.deleteAccount(username);

    for (const request of requests) {
      if (request.status !== "accepted" && request.image) {
        fs.unlink("." + request.image, () => {});
      }
    }

    if (user.foto_profilo) {
      fs.unlink("." + user.foto_profilo, () => {});
    }

    res.json({ username });
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

    const users = await User.search(text);
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
exports.getUserRole = async (req, res) => {
  try {
    const username = req.params.username;
    const role = await User.getRole(username);

    if (!role) {
      return res.status(404).json({ message: `No role assigned to user ${username}.`});
    }
    
    res.json(role);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
