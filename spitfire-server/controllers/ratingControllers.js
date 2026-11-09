const Rating = require("../models/ratingModel");
const Song = require("../models/songModel");
const Record = require("../models/recordModel");

async function findTarget(type, id) {
  if (type === "song") return await Song.findById(id);
  if (type === "record") return await Record.findById(id);
  return null;
}

async function sendSummary(res, type, id, username) {
  const summary = await Rating.getSummary(type, id);
  summary.myRating = username ? await Rating.findByUser(type, id, username) : 0;
  res.json(summary);
}

exports.getRating = async (req, res) => {
  try {
    const { type, id } = req.params;
    const username = req.user ? req.user.username : null;

    const target = await findTarget(type, id);
    if (!target) {
      return res.status(404).json({ message: "Content not found" });
    }

    await sendSummary(res, type, id, username);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.rate = async (req, res) => {
  try {
    const { type, id } = req.params;
    const username = req.user.username;
    const value = Number(req.body.value);

    const target = await findTarget(type, id);
    if (!target) {
      return res.status(404).json({ message: "Content not found" });
    }

    // Il voto va da mezza stella a 5 stelle, a passi di mezza stella
    if (!value || value < 0.5 || value > 5 || value * 2 !== Math.round(value * 2)) {
      return res.status(400).json({ message: "The rating must be between 0.5 and 5" });
    }

    await Rating.save(type, id, username, value);

    const summary = await Rating.getSummary(type, id);
    await Rating.updateAverage(type, id, summary.average);

    await sendSummary(res, type, id, username);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.removeRating = async (req, res) => {
  try {
    const { type, id } = req.params;
    const username = req.user.username;

    const target = await findTarget(type, id);
    if (!target) {
      return res.status(404).json({ message: "Content not found" });
    }

    await Rating.remove(type, id, username);

    const summary = await Rating.getSummary(type, id);
    await Rating.updateAverage(type, id, summary.average);

    await sendSummary(res, type, id, username);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
