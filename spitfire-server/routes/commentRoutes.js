const express = require("express");
const router = express.Router();
const commentController = require("../controllers/commentControllers");
const authMiddleware = require("../middleware/authMiddleware");
const optionalAuthMiddleware = require("../middleware/optionalAuthMiddleware");

router.get("/", optionalAuthMiddleware, commentController.getComments);
router.get("/:id/replies", optionalAuthMiddleware, commentController.getReplies);

router.post("/", authMiddleware, commentController.create);
router.delete("/:id", authMiddleware, commentController.deleteComment);

router.post("/:id/vote", authMiddleware, commentController.vote);

module.exports = router;
