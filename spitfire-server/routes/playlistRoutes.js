const express = require("express");
const router = express.Router();
const playlistController = require("../controllers/playlistControllers");
const authMiddleware = require("../middleware/authMiddleware");

router.post("/", authMiddleware, playlistController.create);
router.post("/songs", authMiddleware, playlistController.addSong);
router.delete("/songs", authMiddleware, playlistController.removeSong);
router.get("/:playlistId/songs", playlistController.getSongs);
router.get("/user/:username", playlistController.getUserPlaylists);
router.get("/:playlistId", playlistController.getPlaylistById);

module.exports = router;