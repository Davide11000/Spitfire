const RoleRequest = require("../models/roleRequestModel");
const User = require("../models/userModel");
const Notification = require("../models/notificationModel");

const REQUIRED = 10;

exports.getMine = async (req, res) => {
  try {
    const username = req.user.username;
    const accepted = await RoleRequest.countAccepted(username);
    const request = await RoleRequest.findLastByUsername(username);

    res.json({ role: req.user.ruolo, accepted, required: REQUIRED, request: request || null });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.create = async (req, res) => {
  try {
    const username = req.user.username;
    const text = (req.body.text || "").trim();

    if (req.user.ruolo !== "utente") {
      return res.status(400).json({ message: "You are already a moderator" });
    }
    if (!text) {
      return res.status(400).json({ message: "Tell us why you want to become a moderator" });
    }

    const accepted = await RoleRequest.countAccepted(username);
    if (accepted < REQUIRED) {
      return res.status(403).json({ message: "You need at least " + REQUIRED + " accepted requests" });
    }

    const last = await RoleRequest.findLastByUsername(username);
    if (last && last.status === "pending") {
      return res.status(400).json({ message: "You have already sent a request" });
    }

    const request = await RoleRequest.create(username, text);

    const admins = await User.findAdmins();
    for (const admin of admins) {
      await Notification.create(admin.username, "new_role_request", username, null, text);
    }

    res.status(201).json(request);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getPending = async (req, res) => {
  try {
    const requests = await RoleRequest.findPending();
    res.json(requests);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.accept = async (req, res) => {
  try {
    const request = await RoleRequest.findById(req.params.id);

    if (!request || request.status !== "pending") {
      return res.status(404).json({ message: "Request not found" });
    }

    await User.setRole(request.username, "moderatore");
    const result = await RoleRequest.setStatus(request.id, "accepted");
    await Notification.create(request.username, "role_accepted", req.user.username, null, "You are now a moderator");

    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.reject = async (req, res) => {
  try {
    const request = await RoleRequest.findById(req.params.id);

    if (!request || request.status !== "pending") {
      return res.status(404).json({ message: "Request not found" });
    }

    const result = await RoleRequest.setStatus(request.id, "rejected");
    await Notification.create(request.username, "role_rejected", req.user.username, null, request.text);

    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
