const express = require("express");
const router = express.Router();
const roleRequestController = require("../controllers/roleRequestControllers");
const authMiddleware = require("../middleware/authMiddleware");
const adminMiddleware = require("../middleware/adminMiddleware");

router.get("/me", authMiddleware, roleRequestController.getMine);
router.post("/", authMiddleware, roleRequestController.create);

router.get("/", authMiddleware, adminMiddleware, roleRequestController.getPending);
router.post("/:id/accept", authMiddleware, adminMiddleware, roleRequestController.accept);
router.post("/:id/reject", authMiddleware, adminMiddleware, roleRequestController.reject);

module.exports = router;
