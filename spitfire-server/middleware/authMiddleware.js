const jwt = require("jsonwebtoken");
const User = require("../models/userModel");

const SECRET = process.env.JWT_SECRET;

module.exports = async (req, res, next) => {

    const authHeader = req.headers["authorization"];

    if (!authHeader) {
        return res.status(401).json({ message: "Access denied" });
    }

    const token = authHeader.split(" ")[1];

    try {

        const verified = jwt.verify(token, SECRET);

        const user = await User.findByUsername(verified.username);
        if (!user) {
            return res.status(401).json({ message: "This account no longer exists" });
        }

        req.user = { ...verified, ruolo: user.ruolo };
        next();
    } catch (err) {
        res.status(400).json({ message: "Invalid token" });
    }
};
