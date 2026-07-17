const express = require("express");
const router = express.Router();
const authController = require("../controllers/authControllers");
const authMiddleware = require("../middleware/authMiddleware");

router.post("/register", authController.register);
router.post("/login", authController.login);

// esempio route protetta
router.get("/profile", authMiddleware, authController.getProfile);

module.exports = router;