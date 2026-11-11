const Report = require("../models/reportModel");
const Comment = require("../models/commentModel");
const Notification = require("../models/notificationModel");
const Annotation = require("../models/annotationModel");

exports.create = async (req, res) => {
    try {
        const username = req.user.username;
        const { commentId, reason } = req.body;

        if (!reason || !reason.trim()) {
            return res.status(400).json({ message: "Please write the reason of the report" });
        }

        const comment = await Comment.findById(commentId, null);
        if (!comment) {
            return res.status(404).json({ message: "Comment not found" });
        }

        if (comment.username === username) {
            return res.status(400).json({ message: "You cannot report your own comment" });
        }

        const existing = await Report.findPendingByUser(comment.id, username);
        if (existing) {
            return res.status(400).json({ message: "You have already reported this comment" });
        }

        const report = await Report.create(comment.id, username, reason.trim());
        res.status(201).json(report);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getPendingReports = async (req, res) => {
    try {
        const reports = await Report.findPending();
        res.json(reports);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.accept = async (req, res) => {
    try {
        const report = await Report.findById(req.params.id);

        if (!report || report.status !== "pending") {
            return res.status(404).json({ message: "Report not found" });
        }

        await Comment.removeLikes(report.comment_id);
        await Report.removeByComment(report.comment_id);
        await Notification.removeByComment(report.comment_id);
        await Comment.delete(report.comment_id);

        res.json({ id: report.id, comment_id: report.comment_id, status: "accepted" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.reject = async (req, res) => {
    try {
        const report = await Report.findById(req.params.id);

        if (!report || report.status !== "pending") {
            return res.status(404).json({ message: "Report not found" });
        }

        const result = await Report.setStatus(report.id, "rejected");
        res.json(result);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.createForAnnotation = async (req, res) => {
    try {
        const username = req.user.username;
        const { annotationId, reason } = req.body;

        if (!reason || !reason.trim()) {
            return res.status(400).json({ message: "Please write the reason of the report" });
        }

        const annotation = await Annotation.findById(annotationId);
        if (!annotation || annotation.status !== "approved") {
            return res.status(404).json({ message: "Annotation not found" });
        }

        if (annotation.username === username) {
            return res.status(400).json({ message: "You cannot report your own annotation" });
        }

        const existing = await Report.findPendingAnnotationByUser(annotation.id, username);
        if (existing) {
            return res.status(400).json({ message: "You have already reported this annotation" });
        }

        const report = await Report.createForAnnotation(annotation.id, username, reason.trim());
        res.status(201).json(report);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getPendingAnnotationReports = async (req, res) => {
    try {
        const reports = await Report.findPendingAnnotations();
        res.json(reports);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.acceptAnnotationReport = async (req, res) => {
    try {
        const report = await Report.findAnnotationReportById(req.params.id);

        if (!report || report.status !== "pending") {
            return res.status(404).json({ message: "Report not found" });
        }

        await Comment.removeByTarget("annotation", report.annotation_id);
        await Annotation.delete(report.annotation_id);

        res.json({ id: report.id, annotation_id: report.annotation_id, status: "accepted" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.rejectAnnotationReport = async (req, res) => {
    try {
        const report = await Report.findAnnotationReportById(req.params.id);

        if (!report || report.status !== "pending") {
            return res.status(404).json({ message: "Report not found" });
        }

        const result = await Report.setAnnotationStatus(report.id, "rejected");
        res.json(result);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
