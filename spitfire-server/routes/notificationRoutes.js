const express = require("express");
const router = express.Router();
const notificationController = require("../controllers/notificationControllers");
const authMiddleware = require("../middleware/authMiddleware");

router.get("/", authMiddleware, notificationController.getNotifications);
router.get("/unread", authMiddleware, notificationController.getUnreadCount);
router.post("/read", authMiddleware, notificationController.markAllAsRead);

module.exports = router;
