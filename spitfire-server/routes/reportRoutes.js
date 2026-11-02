const express = require("express");
const router = express.Router();
const reportController = require("../controllers/reportControllers");
const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

router.post("/", authMiddleware, reportController.create);

router.get("/", authMiddleware, roleMiddleware, reportController.getPendingReports);
router.post("/:id/accept", authMiddleware, roleMiddleware, reportController.accept);
router.post("/:id/reject", authMiddleware, roleMiddleware, reportController.reject);

module.exports = router;
