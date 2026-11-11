const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const User = require("../models/userModel");
const PasswordReset = require("../models/passwordResetModel");
const { sendMail } = require("../utils/mailer");

const SECRET = process.env.JWT_SECRET;
const EMAIL = /^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,}$/;

function validatePassword(password) {
    if (password.length < 8) {
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

    const token = jwt.sign({ username: user.username, email: user.email, ruolo: "utente" }, SECRET, {
      expiresIn: "1d"
    });

    res.status(201).json({ username: user.username, email: user.email, token });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: "Current and new password are required" });
    }

    const user = await User.findByUsername(req.user.username);

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Current password is wrong" });
    }

    const passwordError = validatePassword(newPassword);
    if (passwordError) {
      return res.status(400).json({ message: passwordError });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    const result = await User.updatePassword(user.username, hashedPassword);

    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.changeEmail = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "New email and password are required" });
    }

    if (!EMAIL.test(email)) {
      return res.status(400).json({ message: "Invalid email format" });
    }

    const user = await User.findByUsername(req.user.username);

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Password is wrong" });
    }

    const existingEmail = await User.findByEmail(email);
    if (existingEmail && existingEmail.username !== user.username) {
      return res.status(400).json({ message: "Email already exists" });
    }

    const result = await User.updateEmail(user.username, email);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { id, password } = req.body;
    let user;
    
    if (EMAIL.test(id)) {
      user = await User.findByEmail(id);
    } else {
      user = await User.findByUsername(id);
    }

    if (!user) {
      return res.status(400).json({ message: "Invalid username or email" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid password" });
    }

    const token = jwt.sign({ username: user.username, email: user.email, ruolo: user.ruolo }, SECRET, {
      expiresIn: "1d"
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
      return res.status(404).json({ message: "User not found" });
    }

    const { password, ...safeUser } = user;

    res.json(safeUser);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.forgotPassword = async (req, res) => {
  try {
    const email = (req.body.email || "").trim();

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    const user = await User.findByEmail(email);
    if (!user) {
      return res.status(404).json({ message: "There is no account with this email" });
    }

    const token = crypto.randomBytes(32).toString("hex");
    const expiresAt = Date.now() + 30 * 60 * 1000;

    await PasswordReset.removeByUsername(user.username);
    await PasswordReset.create(token, user.username, expiresAt);

    const link = (process.env.FRONTEND_URL || "http://localhost:8100") + "/reset-password?token=" + token;
    await sendMail(
      user.email,
      "Reset your Spitfire password",
      "<p>Hi <b>" + user.username + "</b>,</p>" +
        "<p>click the link below to choose a new password. It expires in 30 minutes.</p>" +
        "<p><a href=\"" + link + "\">Reset my password</a></p>" +
        "<p>If you didn't ask for it, just ignore this email.</p>"
    );

    res.json({ message: "We sent you a link to reset the password" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.resetPassword = async (req, res) => {
  try {
    const { token, password } = req.body;

    if (!token || !password) {
      return res.status(400).json({ message: "Token and password are required" });
    }

    const reset = await PasswordReset.findByToken(token);
    if (!reset || reset.expires_at < Date.now()) {
      return res.status(400).json({ message: "This link is not valid or has expired" });
    }

    const passwordError = validatePassword(password);
    if (passwordError) {
      return res.status(400).json({ message: passwordError });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    await User.updatePassword(reset.username, hashedPassword);
    await PasswordReset.removeByUsername(reset.username);

    res.json({ message: "Password changed" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
