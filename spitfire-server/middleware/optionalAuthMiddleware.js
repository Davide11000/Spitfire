const jwt = require("jsonwebtoken");

const SECRET = process.env.JWT_SECRET;

module.exports = (req, res, next) => {
    const authHeader = req.headers["authorization"];

    if (authHeader) {
        try {
            req.user = jwt.verify(authHeader.split(" ")[1], SECRET);
        } catch (err) {
            req.user = null;
        }
    }

    next();
};
