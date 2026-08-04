const bcrypt = require("bcrypt"); // per criptare le informazioni
const jwt = require("jsonwebtoken");
const User = require("../models/userModel");

const SECRET = process.env.JWT_SECRET;
const EMAIL = /^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,}$/;

function validatePassword(password) {
    if (password.length < 6) {
      return "Password must contain at least 8 characters";
    }
    if (!/[A-Z]/.test(password)) {
      return "Password must contain at least one uppercase letter";
    }
    if (!/[a-z]/.test(password)) {
      return "Password must contain at least one undercase letter";
    }
    if (!/[0-9]/.test(password)) {
      return "Password must contain at least one number";
    }
    return null;
  }

exports.register = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ message: "Username, email and password are required" });
    }

    
    console.log("Registering user:", username);
    console.log("Email:", email);
    console.log("Password:", password);
    
    const existingUser = await User.findByUsername(username);
    if (existingUser) {
      return res.status(400).json({ message: "Username already exists" });
    }

    if(!EMAIL.test(email)){
      return res.status(400).json({ message: "Invalid email format" });
    }

    const passwordError = validatePassword(password);
    if(passwordError){
      return res.status(400).json({ message: passwordError });
    }

    const existingEmail = await User.findByEmail(email);
    if (existingEmail) {
      return res.status(400).json({ message: "Email already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create(username, email, hashedPassword);

    res.status(201).json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { id, password } = req.body;

    console.log("ID:", id)
    console.log("Password:", password);
    let user;
    
    if (EMAIL.test(id)) {
      user = await User.findByEmail(id);
    } else {
      user = await User.findByUsername(id);
    }

    if (!user) {
      return res.status(400).json({ message: "Invalid username or email" });
    }

   console.log("Password type:", typeof(password), "User password type:", typeof(user.password));

    const isMatch = await bcrypt.compare(password, user.password);
    console.log("Password match:", password, user.password, isMatch);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid password" });
    }

    const token = jwt.sign({ username: user.username, email: user.email, ruolo: user.ruolo }, SECRET, {
      expiresIn: "1h"
    });

    res.json({ token });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getProfile = async (req, res) => {
  try {
    const userUsername = req.user.username;

    const user = await User.findByUsername(userUsername);

    if (!user) {
      return res.status(404).json({ message: "Utente non trovato" });
    }

    const { password, ...safeUser } = user;

    res.json(safeUser);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};