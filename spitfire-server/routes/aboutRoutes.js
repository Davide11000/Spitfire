const express = require("express");
const router = express.Router();
const aboutController = require("../controllers/aboutControllers");
const authMiddleware = require("../middleware/authMiddleware");
const optionalAuthMiddleware = require("../middleware/optionalAuthMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

router.get("/record/:id", optionalAuthMiddleware, aboutController.getByRecord);
router.post("/", authMiddleware, aboutController.create);

router.post("/edits/:editId/approve", authMiddleware, roleMiddleware, aboutController.approveEdit);
router.post("/edits/:editId/reject", authMiddleware, roleMiddleware, aboutController.rejectEdit);

router.post("/:id/approve", authMiddleware, roleMiddleware, aboutController.approve);
router.post("/:id/reject", authMiddleware, roleMiddleware, aboutController.reject);
router.delete("/:id", authMiddleware, roleMiddleware, aboutController.deleteAbout);
router.post("/:id/vote", authMiddleware, aboutController.vote);
router.post("/:id/edits", authMiddleware, aboutController.proposeEdit);

module.exports = router;
