const express = require("express");
const router = express.Router();
const userController = require("../controllers/userControllers");
const authController = require("../controllers/authControllers");
const favouriteController = require("../controllers/favouriteControllers");
const authMiddleware = require("../middleware/authMiddleware");
const optionalAuthMiddleware = require("../middleware/optionalAuthMiddleware");
const uploadMiddleware = require("../middleware/uploadMiddleware");

// Ricerca utenti (va prima di /:username, altrimenti "search" verrebbe preso per uno username)
router.get("/search", userController.search);

// Foto profilo dell'utente loggato
router.put("/me/photo", authMiddleware, uploadMiddleware, userController.uploadPhoto);
router.delete("/me/photo", authMiddleware, userController.removePhoto);

router.put("/me/email", authMiddleware, authController.changeEmail);
router.put("/me/password", authMiddleware, authController.changePassword);
router.put("/me/bio", authMiddleware, userController.updateBio);
router.put("/me/who-can-message", authMiddleware, userController.updateWhoCanMessage);
router.delete("/me", authMiddleware, userController.deleteAccount);

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

router.get("/:username/role", userController.getUserRole);
router.get("/:username", optionalAuthMiddleware, userController.getUserByUsername);

module.exports = router;
