const Message = require("../models/messageModel");
const User = require("../models/userModel");
const Notification = require("../models/notificationModel");
const Follow = require("../models/followModel");

exports.send = async (req, res) => {
    try {
        const sender = req.user.username;
        const receiver = req.params.username;
        const { text } = req.body;

        if (!text || !text.trim()) {
            return res.status(400).json({ message: "The message cannot be empty" });
        }

        if (sender === receiver) {
            return res.status(400).json({ message: "You cannot send a message to yourself" });
        }

        const user = await User.findByUsername(receiver);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        if (user.who_can_message === "nobody") {
            return res.status(403).json({ message: "This user does not accept messages" });
        }

        if (user.who_can_message === "following") {
            const following = await Follow.findFollowing(receiver);
            if (!following.some(f => f.following === sender)) {
                return res.status(403).json({ message: "This user only accepts messages from people they follow" });
            }
        }

        const result = await Message.create(sender, receiver, text.trim());

        const existing = await Notification.findUnreadMessage(receiver, sender);
        if (existing) {
            await Notification.updateMessage(existing.id, text.trim());
        } else {
            await Notification.create(receiver, "message", sender, null, text.trim());
        }

        const message = await Message.findById(result.id);
        res.status(201).json(message);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getChat = async (req, res) => {
    try {
        const me = req.user.username;
        const other = req.params.username;

        let after = Number(req.query.after);
        if (!after) after = 0;

        const messages = await Message.findChat(me, other, after);

        await Message.markAsRead(other, me);
        await Notification.markMessagesAsRead(me, other);

        res.json(messages);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getConversations = async (req, res) => {
    try {
        const conversations = await Message.findConversations(req.user.username);
        res.json(conversations);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getUnreadCount = async (req, res) => {
    try {
        const unread = await Message.countUnread(req.user.username);
        res.json({ unread });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
