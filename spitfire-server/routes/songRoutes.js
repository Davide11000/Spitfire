const express = require("express");
const router = express.Router();
const songController = require("../controllers/songControllers");
const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

router.post("/", authMiddleware, roleMiddleware, songController.create);
router.get("/song/:songname", songController.getSongBySongname); 
router.get("/record/:recordid", songController.getSongByRecordID);
router.get("/:id", songController.getSongById); 

module.exports = router;