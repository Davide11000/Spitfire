const express = require("express");
const router = express.Router();
const annotationController = require("../controllers/annotationControllers");
const authMiddleware = require("../middleware/authMiddleware");
const optionalAuthMiddleware = require("../middleware/optionalAuthMiddleware");
const adminMiddleware = require("../middleware/adminMiddleware");

router.get("/latest", annotationController.getLatest);
router.get("/song/:songId", optionalAuthMiddleware, annotationController.getBySong);
router.post("/", authMiddleware, annotationController.create);

router.post("/edits/:editId/approve", authMiddleware, adminMiddleware, annotationController.approveEdit);
router.post("/edits/:editId/reject", authMiddleware, adminMiddleware, annotationController.rejectEdit);

router.post("/:id/approve", authMiddleware, adminMiddleware, annotationController.approve);
router.post("/:id/reject", authMiddleware, adminMiddleware, annotationController.reject);
router.delete("/:id", authMiddleware, adminMiddleware, annotationController.deleteAnnotation);
router.post("/:id/vote", authMiddleware, annotationController.vote);
router.post("/:id/edits", authMiddleware, annotationController.proposeEdit);

module.exports = router;
