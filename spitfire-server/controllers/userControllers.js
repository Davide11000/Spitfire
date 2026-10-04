const User = require("../models/userModel");

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