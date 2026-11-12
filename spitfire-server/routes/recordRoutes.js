const express = require("express");
const router = express.Router();
const recordController = require("../controllers/recordControllers")
const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

router.post("/", authMiddleware, roleMiddleware, recordController.create); 
router.get("/search", recordController.search);
router.get("/artist/:artid", recordController.getRecordByArtID);
router.get("/record/:recordname", recordController.getRecordByName);
router.get("/on-this-day", recordController.getOnThisDay);
router.get("/recent/:len", recordController.getRecentRecords);
router.get("/top/:len", recordController.getTopRecords);
router.get("/discover", recordController.getDiscoverRecords);
router.get("/languages", recordController.getLanguages);
router.get("/:id", recordController.getRecordByID);

module.exports = router;