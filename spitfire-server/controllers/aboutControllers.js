const About = require("../models/aboutModel");
const Record = require("../models/recordModel");
const User = require("../models/userModel");
const Notification = require("../models/notificationModel");
const Comment = require("../models/commentModel");

function isModerator(user) {
    return !!user && (user.ruolo === "admin" || user.ruolo === "moderatore");
}

// Le notifiche dell'about portano alla pagina dell'album (content_type = record)
async function notifyModerators(fromUser, type, recordId, albumName) {
    const moderators = await User.findModerators();

    for (const m of moderators) {
        if (m.username !== fromUser) {
            await Notification.createForContent(m.username, type, fromUser, "record", recordId, albumName);
        }
    }
}

async function notifyUser(username, type, fromUser, recordId, albumName) {
    if (username && username !== fromUser) {
        await Notification.createForContent(username, type, fromUser, "record", recordId, albumName);
    }
}

async function getAlbumName(about) {
    const record = await Record.findById(about.target_id);
    return record ? record.recordname : null;
}

exports.getByRecord = async (req, res) => {
    try {
        const username = req.user ? req.user.username : null;
        const moderator = isModerator(req.user);

        const active = await About.findActive("record", req.params.id);

        // Quello in attesa lo vedono solo l'autore e i moderatori
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
};

exports.create = async (req, res) => {
    try {
        const username = req.user.username;
        const { recordId, text } = req.body;

        if (!text || !text.trim()) {
            return res.status(400).json({ message: "The about cannot be empty" });
        }

        const record = await Record.findById(recordId);
        if (!record) {
            return res.status(404).json({ message: "Record not found" });
        }

        const existing = await About.findActive("record", record.id);
        if (existing) {
            return res.status(400).json({ message: "This record already has an about (or one is waiting for review)" });
        }

        const status = isModerator(req.user) ? "approved" : "pending";
        const result = await About.create("record", record.id, username, text.trim(), status);

        if (status === "pending") {
            await notifyModerators(username, "new_about", record.id, record.recordname);
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
        await notifyUser(about.username, "about_approved", req.user.username, about.target_id, await getAlbumName(about));
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
        await notifyUser(about.username, "about_rejected", req.user.username, about.target_id, await getAlbumName(about));
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
            return res.status(400).json({ message: "The about cannot be empty" });
        }

        const about = await About.findById(req.params.id);
        if (!about || about.status !== "approved") {
            return res.status(404).json({ message: "About not found" });
        }

        if (text.trim() === about.text) {
            return res.status(400).json({ message: "Change the text before sending the edit" });
        }

        // Admin e moderatori modificano subito
        if (isModerator(req.user)) {
            await About.createEdit(about.id, username, text.trim(), "approved");
            await About.updateText(about.id, text.trim());
            return res.status(201).json({ id: about.id, status: "approved", text: text.trim() });
        }

        const existing = await About.findPendingEditByUser(about.id, username);
        if (existing) {
            return res.status(400).json({ message: "You already proposed an edit for this about" });
        }

        const result = await About.createEdit(about.id, username, text.trim(), "pending");
        await notifyModerators(username, "new_about_edit", about.target_id, await getAlbumName(about));
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
        await notifyUser(edit.username, "about_edit_approved", req.user.username, about.target_id, await getAlbumName(about));
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
        await notifyUser(edit.username, "about_edit_rejected", req.user.username, about.target_id, await getAlbumName(about));
        res.json({ id: edit.id, status: "rejected" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
