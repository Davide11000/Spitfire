const express = require("express");
const router = express.Router();
const artistController = require("../controllers/artistControllers");
const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

router.post("/", authMiddleware, roleMiddleware, artistController.create);
router.get("/search", artistController.search);
router.get("/on-this-day", artistController.getOnThisDay);
router.get("/name/:artname", artistController.findArtistbyName);
router.get("/:artId/genres", artistController.getGenres);
router.get("/:artId/discography", artistController.getDiscography);
router.get("/:artId/top-songs", artistController.getTopSongs);
router.get("/:artId", artistController.findArtistbyID);

module.exports = router;
