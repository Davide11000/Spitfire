const Message = require("../models/messageModel");
const User = require("../models/userModel");
const Notification = require("../models/notificationModel");
const Follow = require("../models/followModel");

function withoutHidden(message) {
    if (message) delete message.hidden;
    return message;
}

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

        const blocked = await Message.isBlocked(receiver, sender);
        const result = await Message.create(sender, receiver, text.trim(), blocked);

        if (!blocked) {
            const existing = await Notification.findUnreadMessage(receiver, sender);
            if (existing) {
                await Notification.updateMessage(existing.id, text.trim());
            } else {
                await Notification.create(receiver, "message", sender, null, text.trim());
            }
        }

        const message = await Message.findById(result.id);
        res.status(201).json(withoutHidden(message));
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

        res.json(messages.map(withoutHidden));
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getConversations = async (req, res) => {
    try {
        const conversations = await Message.findConversations(req.user.username);
        res.json(conversations.map(withoutHidden));
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

exports.getBlock = async (req, res) => {
    try {
        const blocked = await Message.isBlocked(req.user.username, req.params.username);
        res.json({ blocked });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.block = async (req, res) => {
    try {
        const me = req.user.username;
        const other = req.params.username;

        if (me === other) {
            return res.status(400).json({ message: "You cannot block yourself" });
        }

        const user = await User.findByUsername(other);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        await Message.block(me, other);
        res.json({ blocked: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.unblock = async (req, res) => {
    try {
        await Message.unblock(req.user.username, req.params.username);
        res.json({ blocked: false });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
