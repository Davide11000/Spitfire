const Comment = require("../models/commentModel");
const Report = require("../models/reportModel");
const Notification = require("../models/notificationModel");
const Song = require("../models/songModel");
const Record = require("../models/recordModel");
const Artist = require("../models/artistModel");
const Playlist = require("../models/playlistModel");

async function findTarget(type, id) {
    if (type === "song") return await Song.findById(id);
    if (type === "record") return await Record.findById(id);
    if (type === "artist") return await Artist.findById(id);
    if (type === "playlist") return await Playlist.findById(id);
    return null;
}

exports.create = async (req, res) => {
    try {
        const username = req.user.username;
        const { type, targetId, parentId, text } = req.body;

        if (!text || !text.trim()) {
            return res.status(400).json({ message: "The comment cannot be empty" });
        }

        if (type !== "song" && type !== "record" && type !== "artist" && type !== "playlist") {
            return res.status(400).json({ message: "Invalid type" });
        }

        const target = await findTarget(type, targetId);
        if (!target) {
            return res.status(404).json({ message: "Content not found" });
        }

        let parent = null;
        if (parentId) {
            parent = await Comment.findById(parentId, null);

            if (!parent || parent.target_type !== type || parent.target_id !== Number(targetId)) {
                return res.status(404).json({ message: "Comment not found" });
            }

            if (parent.parent_id) {
                return res.status(400).json({ message: "You cannot reply to a reply" });
            }
        }

        const result = await Comment.create(username, type, targetId, parentId || null, text.trim());

        if (parent && parent.username && parent.username !== username) {
            await Notification.create(parent.username, "reply", username, result.id, null);
        }

        const comment = await Comment.findById(result.id, username);
        res.status(201).json(comment);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getComments = async (req, res) => {
    try {
        const { type, id } = req.query;
        const username = req.user ? req.user.username : null;

        let page = Number(req.query.page);
        if (!page || page < 1) page = 1;

        const limit = 10;
        const offset = (page - 1) * limit;

        const comments = await Comment.findByTarget(type, id, username, limit, offset);
        const total = await Comment.countByTarget(type, id);

        res.json({ comments, total, page, totalPages: Math.ceil(total / limit) });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getReplies = async (req, res) => {
    try {
        const username = req.user ? req.user.username : null;

        const replies = await Comment.findReplies(req.params.id, username);
        res.json(replies);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.deleteComment = async (req, res) => {
    try {
        const comment = await Comment.findById(req.params.id, null);

        if (!comment) {
            return res.status(404).json({ message: "Comment not found" });
        }

        if (comment.username !== req.user.username && req.user.ruolo !== "admin" && req.user.ruolo !== "moderatore") {
            return res.status(403).json({ message: "You cannot delete this comment" });
        }

        await Comment.removeLikes(comment.id);
        await Report.removeByComment(comment.id);
        await Notification.removeByComment(comment.id);
        await Comment.delete(comment.id);
        res.json({ id: comment.id });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.addLike = async (req, res) => {
    try {
        const username = req.user.username;
        const comment = await Comment.findById(req.params.id, username);

        if (!comment) {
            return res.status(404).json({ message: "Comment not found" });
        }

        if (comment.liked) {
            return res.status(400).json({ message: "You already liked this comment" });
        }

        await Comment.addLike(comment.id, username);

        if (comment.username && comment.username !== username) {
            await Notification.create(comment.username, "like", username, comment.id, null);
        }
        res.status(201).json({ id: comment.id, likes: comment.likes + 1, liked: 1 });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.removeLike = async (req, res) => {
    try {
        const username = req.user.username;
        const comment = await Comment.findById(req.params.id, username);

        if (!comment) {
            return res.status(404).json({ message: "Comment not found" });
        }

        if (!comment.liked) {
            return res.status(400).json({ message: "You have not liked this comment" });
        }

        await Comment.removeLike(comment.id, username);
        await Notification.removeLike(comment.username, username, comment.id);
        res.json({ id: comment.id, likes: comment.likes - 1, liked: 0 });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
