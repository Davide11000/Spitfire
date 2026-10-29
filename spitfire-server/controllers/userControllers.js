const User = require("../models/userModel");
const fs = require("fs");

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

    const { password, ...safeUser } = user;
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
