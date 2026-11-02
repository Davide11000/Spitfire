const express = require("express");
const router = express.Router();
const messageController = require("../controllers/messageControllers");
const authMiddleware = require("../middleware/authMiddleware");

router.get("/conversations", authMiddleware, messageController.getConversations);
router.get("/unread", authMiddleware, messageController.getUnreadCount);

router.get("/:username", authMiddleware, messageController.getChat);
router.post("/:username", authMiddleware, messageController.send);

module.exports = router;
