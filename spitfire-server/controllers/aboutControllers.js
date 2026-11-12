const About = require("../models/aboutModel");
const Record = require("../models/recordModel");
const Artist = require("../models/artistModel");
const User = require("../models/userModel");
const Notification = require("../models/notificationModel");
const Comment = require("../models/commentModel");

function isModerator(user) {
    return !!user && (user.ruolo === "admin" || user.ruolo === "moderatore");
}

async function notifyModerators(fromUser, type, about) {
    const moderators = await User.findModerators();
    const name = await getTargetName(about.target_type, about.target_id);

    for (const m of moderators) {
        if (m.username !== fromUser) {
            await Notification.createForContent(m.username, type, fromUser, about.target_type, about.target_id, name);
        }
    }
}

async function notifyUser(username, type, fromUser, about) {
    if (username && username !== fromUser) {
        const name = await getTargetName(about.target_type, about.target_id);
        await Notification.createForContent(username, type, fromUser, about.target_type, about.target_id, name);
    }
}

async function findTarget(targetType, targetId) {
    if (targetType === "record") return await Record.findById(targetId);
    if (targetType === "artist") return await Artist.findById(targetId);
    return null;
}

async function getTargetName(targetType, targetId) {
    const target = await findTarget(targetType, targetId);
    if (!target) return null;
    return targetType === "artist" ? target.artname : target.recordname;
}

exports.getByRecord = (req, res) => getByTarget("record", req, res);
exports.getByArtist = (req, res) => getByTarget("artist", req, res);

async function getByTarget(targetType, req, res) {
    try {
        const username = req.user ? req.user.username : null;
        const moderator = isModerator(req.user);

        const active = await About.findActive(targetType, req.params.id);

        if (!active || (active.status === "pending" && !moderator && active.username !== username)) {
            return res.json(null);
        }

        const about = await About.findWithVotes(active.id, username);
        const edits = await About.findPendingEdits(about.id);
        about.pending_edits = edits.filter(e => moderator || e.username === username);

        res.json(about);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

exports.create = async (req, res) => {
    try {
        const username = req.user.username;
        const { targetType, targetId, text } = req.body;

        if (!text || !text.trim()) {
            return res.status(400).json({ message: "The text cannot be empty" });
        }

        const target = await findTarget(targetType, targetId);
        if (!target) {
            return res.status(404).json({ message: "Page not found" });
        }

        const existing = await About.findActive(targetType, target.id);
        if (existing) {
            return res.status(400).json({ message: "This page already has one (or one is waiting for review)" });
        }

        const status = isModerator(req.user) ? "approved" : "pending";
        const result = await About.create(targetType, target.id, username, text.trim(), status);

        if (status === "pending") {
            await notifyModerators(username, "new_about", { target_type: targetType, target_id: target.id });
        }

        res.status(201).json({ id: result.id, status });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.approve = async (req, res) => {
    try {
        const about = await About.findById(req.params.id);
        if (!about || about.status !== "pending") {
            return res.status(404).json({ message: "About not found" });
        }

        await About.setStatus(about.id, "approved");
        await notifyUser(about.username, "about_approved", req.user.username, about);
        res.json({ id: about.id, status: "approved" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.reject = async (req, res) => {
    try {
        const about = await About.findById(req.params.id);
        if (!about || about.status !== "pending") {
            return res.status(404).json({ message: "About not found" });
        }

        await About.setStatus(about.id, "rejected");
        await notifyUser(about.username, "about_rejected", req.user.username, about);
        res.json({ id: about.id, status: "rejected" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.deleteAbout = async (req, res) => {
    try {
        const about = await About.findById(req.params.id);
        if (!about) {
            return res.status(404).json({ message: "About not found" });
        }

        await Comment.removeByTarget("about", about.id);
        await About.delete(about.id);
        res.json({ id: about.id });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.vote = async (req, res) => {
    try {
        const value = Number(req.body.value);
        if (value !== 1 && value !== -1 && value !== 0) {
            return res.status(400).json({ message: "Invalid vote" });
        }

        const about = await About.findById(req.params.id);
        if (!about || about.status !== "approved") {
            return res.status(404).json({ message: "About not found" });
        }

        await About.setVote(about.id, req.user.username, value);
        const votes = await About.getScore(about.id);
        res.json({ id: about.id, score: votes.score, my_vote: value || null });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.proposeEdit = async (req, res) => {
    try {
        const username = req.user.username;
        const { text } = req.body;

        if (!text || !text.trim()) {
            return res.status(400).json({ message: "The text cannot be empty" });
        }

        const about = await About.findById(req.params.id);
        if (!about || about.status !== "approved") {
            return res.status(404).json({ message: "About not found" });
        }

        if (text.trim() === about.text) {
            return res.status(400).json({ message: "Change the text before sending the edit" });
        }

        if (isModerator(req.user)) {
            await About.createEdit(about.id, username, text.trim(), "approved");
            await About.updateText(about.id, text.trim());
            return res.status(201).json({ id: about.id, status: "approved", text: text.trim() });
        }

        const existing = await About.findPendingEditByUser(about.id, username);
        if (existing) {
            return res.status(400).json({ message: "You already proposed an edit for this text" });
        }

        const result = await About.createEdit(about.id, username, text.trim(), "pending");
        await notifyModerators(username, "new_about_edit", about);
        res.status(201).json({ id: result.id, status: "pending" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.approveEdit = async (req, res) => {
    try {
        const edit = await About.findEditById(req.params.editId);
        if (!edit || edit.status !== "pending") {
            return res.status(404).json({ message: "Edit not found" });
        }

        const about = await About.findById(edit.about_id);
        await About.updateText(edit.about_id, edit.text);
        await About.setEditStatus(edit.id, "approved");
        await notifyUser(edit.username, "about_edit_approved", req.user.username, about);
        res.json({ id: edit.id, status: "approved", text: edit.text });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.rejectEdit = async (req, res) => {
    try {
        const edit = await About.findEditById(req.params.editId);
        if (!edit || edit.status !== "pending") {
            return res.status(404).json({ message: "Edit not found" });
        }

        const about = await About.findById(edit.about_id);
        await About.setEditStatus(edit.id, "rejected");
        await notifyUser(edit.username, "about_edit_rejected", req.user.username, about);
        res.json({ id: edit.id, status: "rejected" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
