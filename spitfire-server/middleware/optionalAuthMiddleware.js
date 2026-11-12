const jwt = require("jsonwebtoken");
const User = require("../models/userModel");

const SECRET = process.env.JWT_SECRET;

module.exports = async (req, res, next) => {
    const authHeader = req.headers["authorization"];

    if (authHeader) {
        try {
            const verified = jwt.verify(authHeader.split(" ")[1], SECRET);
            const user = await User.findByUsername(verified.username);
            req.user = user ? { ...verified, ruolo: user.ruolo } : null;
        } catch (err) {
            req.user = null;
        }
    }

    next();
};
