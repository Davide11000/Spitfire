const express = require("express");
const router = express.Router();
const lyricsControllers = require("../controllers/lyricsControllers");

router.post("/", lyricsControllers.create);
router.get("/song", lyricsControllers.findLyricsBySongId);

module.exports = router;