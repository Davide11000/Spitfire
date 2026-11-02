const Notification = require("../models/notificationModel");

exports.getNotifications = async (req, res) => {
    try {
        const notifications = await Notification.findByUsername(req.user.username);
        res.json(notifications);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getUnreadCount = async (req, res) => {
    try {
        const unread = await Notification.countUnread(req.user.username);
        res.json({ unread });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.markAllAsRead = async (req, res) => {
    try {
        const result = await Notification.markAllAsRead(req.user.username);
        res.json(result);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
