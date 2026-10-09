const express = require("express");
const router = express.Router();
const artistController = require("../controllers/artistControllers");
const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

router.post("/", authMiddleware, roleMiddleware, artistController.create);
router.get("/name/:artname", artistController.findArtistbyName);
router.get("/:artId", artistController.findArtistbyID);


module.exports = router;
