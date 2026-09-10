const express = require("express");
const router = express.Router();
const followController = require("../controllers/followControllers");
const authMiddleware = require("../middleware/authMiddleware");

router.post("/:username/follow", authMiddleware, followController.follow);
router.delete("/:username/follow", authMiddleware, followController.unfollow);

router.get("/:username/followers", followController.getFollowers);
router.get("/:username/following", followController.getFollowing);


module.exports = router;