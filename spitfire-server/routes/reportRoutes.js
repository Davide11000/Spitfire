const express = require("express");
const router = express.Router();
const reportController = require("../controllers/reportControllers");
const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

router.post("/", authMiddleware, reportController.create);

router.post("/annotations", authMiddleware, reportController.createForAnnotation);
router.get("/annotations", authMiddleware, roleMiddleware, reportController.getPendingAnnotationReports);
router.post("/annotations/:id/accept", authMiddleware, roleMiddleware, reportController.acceptAnnotationReport);
router.post("/annotations/:id/reject", authMiddleware, roleMiddleware, reportController.rejectAnnotationReport);

router.get("/", authMiddleware, roleMiddleware, reportController.getPendingReports);
router.post("/:id/accept", authMiddleware, roleMiddleware, reportController.accept);
router.post("/:id/reject", authMiddleware, roleMiddleware, reportController.reject);

module.exports = router;
