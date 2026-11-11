const express = require("express");
const router = express.Router();
const genreController = require("../controllers/genreControllers");
const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

router.get("/", genreController.getAll);

router.get("/record/:recordId", genreController.getRecordGenres);
router.get("/song/:songId", genreController.getSongGenres);

router.post("/record", authMiddleware, roleMiddleware, genreController.addGenreToRecord);
router.delete("/record", authMiddleware, roleMiddleware, genreController.removeGenreFromRecord);
router.post("/song", authMiddleware, roleMiddleware, genreController.addGenreToSong);
router.delete("/song", authMiddleware, roleMiddleware, genreController.removeGenreFromSong);

router.get("/:genreId/records", genreController.getGenreRecords);
router.get("/:genreId/songs", genreController.getGenreSongs);

module.exports = router;
