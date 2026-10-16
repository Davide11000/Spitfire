const jwt = require("jsonwebtoken");

const SECRET = process.env.JWT_SECRET;

// Come authMiddleware, ma non blocca chi non è loggato:
// se il token è valido imposta req.user, altrimenti va avanti senza
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
