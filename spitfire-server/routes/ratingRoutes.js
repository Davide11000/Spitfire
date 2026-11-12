const express = require("express");
const router = express.Router();
const ratingController = require("../controllers/ratingControllers");
const authMiddleware = require("../middleware/authMiddleware");
const optionalAuthMiddleware = require("../middleware/optionalAuthMiddleware");

router.get("/user/:username/:type", ratingController.getUserDistribution);
router.get("/:type/:id/distribution", ratingController.getDistribution);
router.get("/:type/:id", optionalAuthMiddleware, ratingController.getRating);
router.post("/:type/:id", authMiddleware, ratingController.rate);
router.delete("/:type/:id", authMiddleware, ratingController.removeRating);

module.exports = router;
