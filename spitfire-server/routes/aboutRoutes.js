const express = require("express");
const router = express.Router();
const aboutController = require("../controllers/aboutControllers");
const authMiddleware = require("../middleware/authMiddleware");
const optionalAuthMiddleware = require("../middleware/optionalAuthMiddleware");
const adminMiddleware = require("../middleware/adminMiddleware");

router.get("/record/:id", optionalAuthMiddleware, aboutController.getByRecord);
router.get("/artist/:id", optionalAuthMiddleware, aboutController.getByArtist);
router.post("/", authMiddleware, aboutController.create);

router.post("/edits/:editId/approve", authMiddleware, adminMiddleware, aboutController.approveEdit);
router.post("/edits/:editId/reject", authMiddleware, adminMiddleware, aboutController.rejectEdit);

router.post("/:id/approve", authMiddleware, adminMiddleware, aboutController.approve);
router.post("/:id/reject", authMiddleware, adminMiddleware, aboutController.reject);
router.delete("/:id", authMiddleware, adminMiddleware, aboutController.deleteAbout);
router.post("/:id/vote", authMiddleware, aboutController.vote);
router.post("/:id/edits", authMiddleware, aboutController.proposeEdit);

module.exports = router;
