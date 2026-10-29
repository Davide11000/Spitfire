const express = require("express");
const router = express.Router();
const playlistController = require("../controllers/playlistControllers");
const authMiddleware = require("../middleware/authMiddleware");
const optionalAuthMiddleware = require("../middleware/optionalAuthMiddleware");
const playlistUploadMiddleware = require("../middleware/playlistUploadMiddleware");

// Creazione: i dati arrivano come form-data, perché insieme può esserci la copertina
router.post("/", authMiddleware, playlistUploadMiddleware, playlistController.create);
router.post("/songs", authMiddleware, playlistController.addSong);
router.delete("/songs", authMiddleware, playlistController.removeSong);
router.patch("/:playlistId/visibility", authMiddleware, playlistController.setVisibility);
router.delete("/:playlistId", authMiddleware, playlistController.deletePlaylist);

// optionalAuth: il proprietario vede anche le playlist private
router.get("/:playlistId/songs", optionalAuthMiddleware, playlistController.getSongs);
router.get("/user/:username", optionalAuthMiddleware, playlistController.getUserPlaylists);
router.get("/:playlistId", optionalAuthMiddleware, playlistController.getPlaylistById);

module.exports = router;
