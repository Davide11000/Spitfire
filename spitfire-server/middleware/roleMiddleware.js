module.exports = (req, res, next) => {
    if (req.user.ruolo !== 'admin' && req.user.ruolo !== 'moderatore') {
        return res.status(403).json({ message: "Insufficient permissions" });
    }
    next();
};
