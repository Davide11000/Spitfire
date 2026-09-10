const User = require("../models/userModel");

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