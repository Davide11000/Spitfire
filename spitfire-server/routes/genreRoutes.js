const express = require("express");
const router = express.Router();
const genreController = require("../controllers/genreControllers");
const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

router.get("/", genreController.getAll);

// Generi di un album / di una canzone
router.get("/record/:recordId", genreController.getRecordGenres);
router.get("/song/:songId", genreController.getSongGenres);

// Collegare o scollegare un genere: solo admin e moderatori, come per creare album e canzoni
router.post("/record", authMiddleware, roleMiddleware, genreController.addGenreToRecord);
router.delete("/record", authMiddleware, roleMiddleware, genreController.removeGenreFromRecord);
router.post("/song", authMiddleware, roleMiddleware, genreController.addGenreToSong);
router.delete("/song", authMiddleware, roleMiddleware, genreController.removeGenreFromSong);

// Album e canzoni di un genere
router.get("/:genreId/records", genreController.getGenreRecords);
router.get("/:genreId/songs", genreController.getGenreSongs);

module.exports = router;
