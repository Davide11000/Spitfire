const express = require("express");
const router = express.Router();
const lyricsControllers = require("../controllers/lyricsControllers");
const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

router.post("/", authMiddleware, roleMiddleware, lyricsControllers.create);
router.get("/song/:songid", lyricsControllers.findLyricsBySongId);

module.exports = router;
