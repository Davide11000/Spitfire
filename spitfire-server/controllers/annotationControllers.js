const Annotation = require("../models/annotationModel");
const Song = require("../models/songModel");
const User = require("../models/userModel");
const Notification = require("../models/notificationModel");
const Comment = require("../models/commentModel");

function normalize(text) {
    return (text || "").replace(/\r\n/g, "\n");
}

function isAdmin(user) {
    return !!user && user.ruolo === "admin";
}

async function notifyAdmins(fromUser, type, annotationId, text) {
    const admins = await User.findAdmins();

    for (const m of admins) {
        if (m.username !== fromUser) {
            await Notification.createForAnnotation(m.username, type, fromUser, annotationId, text);
        }
    }
}

async function notifyUser(username, type, fromUser, annotationId, text) {
    if (username && username !== fromUser) {
        await Notification.createForAnnotation(username, type, fromUser, annotationId, text);
    }
}

exports.getBySong = async (req, res) => {
    try {
        const username = req.user ? req.user.username : null;
        const admin = isAdmin(req.user);

        const annotations = await Annotation.findBySong(req.params.songId, username, admin);
        const edits = await Annotation.findPendingEdits(req.params.songId);

        for (const a of annotations) {
            a.pending_edits = edits.filter(e => e.annotation_id === a.id && (admin || e.username === username));
        }

        res.json(annotations);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.create = async (req, res) => {
    try {
        const username = req.user.username;
        const { songId, start, end, text } = req.body;

        if (!text || !text.trim()) {
            return res.status(400).json({ message: "The annotation cannot be empty" });
        }

        const song = await Song.findById(songId);
        if (!song) {
            return res.status(404).json({ message: "Song not found" });
        }

        const lyrics = normalize(song.lyrics);
        if (!Number.isInteger(start) || !Number.isInteger(end) || start < 0 || end > lyrics.length || end <= start) {
            return res.status(400).json({ message: "Select a part of the lyrics first" });
        }

        const selectedText = lyrics.substring(start, end);
        if (!selectedText.trim()) {
            return res.status(400).json({ message: "Select a part of the lyrics first" });
        }

        const others = await Annotation.findActiveBySong(songId);
        if (others.some(a => start < a.end_index && end > a.start_index)) {
            return res.status(400).json({ message: "This part of the lyrics already has an annotation" });
        }

        const status = isAdmin(req.user) ? "approved" : "pending";
        const result = await Annotation.create(songId, username, start, end, selectedText, text.trim(), status);

        if (status === "pending") {
            await notifyAdmins(username, "new_annotation", result.id, selectedText);
        }

        res.status(201).json({ id: result.id, status });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.approve = async (req, res) => {
    try {
        const annotation = await Annotation.findById(req.params.id);
        if (!annotation || annotation.status !== "pending") {
            return res.status(404).json({ message: "Annotation not found" });
        }

        await Annotation.setStatus(annotation.id, "approved");
        await notifyUser(annotation.username, "annotation_approved", req.user.username, annotation.id, annotation.selected_text);
        res.json({ id: annotation.id, status: "approved" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.reject = async (req, res) => {
    try {
        const annotation = await Annotation.findById(req.params.id);
        if (!annotation || annotation.status !== "pending") {
            return res.status(404).json({ message: "Annotation not found" });
        }

        await Annotation.setStatus(annotation.id, "rejected");
        await notifyUser(annotation.username, "annotation_rejected", req.user.username, annotation.id, annotation.selected_text);
        res.json({ id: annotation.id, status: "rejected" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.deleteAnnotation = async (req, res) => {
    try {
        const annotation = await Annotation.findById(req.params.id);
        if (!annotation) {
            return res.status(404).json({ message: "Annotation not found" });
        }

        await Comment.removeByTarget("annotation", annotation.id);
        await Annotation.delete(annotation.id);
        res.json({ id: annotation.id });
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

        const annotation = await Annotation.findById(req.params.id);
        if (!annotation || annotation.status !== "approved") {
            return res.status(404).json({ message: "Annotation not found" });
        }

        await Annotation.setVote(annotation.id, req.user.username, value);
        const votes = await Annotation.getScore(annotation.id);
        res.json({ id: annotation.id, score: votes.score, my_vote: value || null });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.proposeEdit = async (req, res) => {
    try {
        const username = req.user.username;
        const { text } = req.body;

        if (!text || !text.trim()) {
            return res.status(400).json({ message: "The annotation cannot be empty" });
        }

        const annotation = await Annotation.findById(req.params.id);
        if (!annotation || annotation.status !== "approved") {
            return res.status(404).json({ message: "Annotation not found" });
        }

        if (text.trim() === annotation.text) {
            return res.status(400).json({ message: "Change the text before sending the edit" });
        }

        if (isAdmin(req.user)) {
            await Annotation.createEdit(annotation.id, username, text.trim(), "approved");
            await Annotation.updateText(annotation.id, text.trim());
            return res.status(201).json({ id: annotation.id, status: "approved", text: text.trim() });
        }

        const existing = await Annotation.findPendingEditByUser(annotation.id, username);
        if (existing) {
            return res.status(400).json({ message: "You already proposed an edit for this annotation" });
        }

        const result = await Annotation.createEdit(annotation.id, username, text.trim(), "pending");
        await notifyAdmins(username, "new_annotation_edit", annotation.id, annotation.selected_text);
        res.status(201).json({ id: result.id, status: "pending" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.approveEdit = async (req, res) => {
    try {
        const edit = await Annotation.findEditById(req.params.editId);
        if (!edit || edit.status !== "pending") {
            return res.status(404).json({ message: "Edit not found" });
        }

        const annotation = await Annotation.findById(edit.annotation_id);
        await Annotation.updateText(edit.annotation_id, edit.text);
        await Annotation.setEditStatus(edit.id, "approved");
        await notifyUser(edit.username, "annotation_edit_approved", req.user.username, edit.annotation_id, annotation ? annotation.selected_text : null);
        res.json({ id: edit.id, status: "approved", text: edit.text });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.rejectEdit = async (req, res) => {
    try {
        const edit = await Annotation.findEditById(req.params.editId);
        if (!edit || edit.status !== "pending") {
            return res.status(404).json({ message: "Edit not found" });
        }

        const annotation = await Annotation.findById(edit.annotation_id);
        await Annotation.setEditStatus(edit.id, "rejected");
        await notifyUser(edit.username, "annotation_edit_rejected", req.user.username, edit.annotation_id, annotation ? annotation.selected_text : null);
        res.json({ id: edit.id, status: "rejected" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getLatest = async (req, res) => {
    try {
        const annotation = await Annotation.findLatest();
        res.json(annotation || null);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
