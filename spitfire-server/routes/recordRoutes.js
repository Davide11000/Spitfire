const express = require("express");
const router = express.Router();
const recordController = require("../controllers/recordControllers")
const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

router.post("/", authMiddleware, roleMiddleware, recordController.create); 
router.get("/artist/:artid", recordController.getRecordByArtID);
router.get("/record/:recordname", recordController.getRecordByName);
router.get("/:id", recordController.getRecordByID); 


module.exports = router;