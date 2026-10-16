const express = require("express");
const router = express.Router();
const userController = require("../controllers/userControllers");
const favouriteController = require("../controllers/favouriteControllers");
const authMiddleware = require("../middleware/authMiddleware");
const uploadMiddleware = require("../middleware/uploadMiddleware");

// Foto profilo dell'utente loggato
router.put("/me/photo", authMiddleware, uploadMiddleware, userController.uploadPhoto);
router.delete("/me/photo", authMiddleware, userController.removePhoto);

// Preferiti dell'utente loggato
router.post("/favourites/artists", authMiddleware, favouriteController.addFavouriteArtist);
router.delete("/favourites/artists", authMiddleware, favouriteController.removeFavouriteArtist);
router.post("/favourites/records", authMiddleware, favouriteController.addFavouriteRecord);
router.delete("/favourites/records", authMiddleware, favouriteController.removeFavouriteRecord);
router.post("/favourites/songs", authMiddleware, favouriteController.addFavouriteSong);
router.delete("/favourites/songs", authMiddleware, favouriteController.removeFavouriteSong);

// Preferiti di un utente qualsiasi
router.get("/:username/favourites/artists", favouriteController.getFavouriteArtists);
router.get("/:username/favourites/records", favouriteController.getFavouriteRecords);
router.get("/:username/favourites/songs", favouriteController.getFavouriteSongs);

router.get("/:username", userController.getUserByUsername);

module.exports = router;
