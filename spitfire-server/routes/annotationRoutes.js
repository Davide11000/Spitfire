const express = require("express");
const router = express.Router();
const annotationController = require("../controllers/annotationControllers");
const authMiddleware = require("../middleware/authMiddleware");
const optionalAuthMiddleware = require("../middleware/optionalAuthMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

router.get("/latest", annotationController.getLatest);
router.get("/song/:songId", optionalAuthMiddleware, annotationController.getBySong);
router.post("/", authMiddleware, annotationController.create);

router.post("/edits/:editId/approve", authMiddleware, roleMiddleware, annotationController.approveEdit);
router.post("/edits/:editId/reject", authMiddleware, roleMiddleware, annotationController.rejectEdit);

router.post("/:id/approve", authMiddleware, roleMiddleware, annotationController.approve);
router.post("/:id/reject", authMiddleware, roleMiddleware, annotationController.reject);
router.delete("/:id", authMiddleware, roleMiddleware, annotationController.deleteAnnotation);
router.post("/:id/vote", authMiddleware, annotationController.vote);
router.post("/:id/edits", authMiddleware, annotationController.proposeEdit);

module.exports = router;
