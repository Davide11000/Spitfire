const Chart = require("../models/chartModel");

const PAGE_SIZE = 20;

exports.getChart = async (req, res) => {
  try {
    const type = req.query.type || "record";
    if (type !== "record" && type !== "song") {
      return res.status(400).json({ message: "Type must be record or song" });
    }

    const year = /^[0-9]{4}$/.test(req.query.year || "") ? req.query.year : null;
    const genre = req.query.genre || null;

    let page = Number(req.query.page);
    if (!page || page < 1) page = 1;
    const offset = (page - 1) * PAGE_SIZE;

    let items, count;
    if (type === "record") {
      items = await Chart.getRecords(year, genre, PAGE_SIZE, offset);
      count = await Chart.countRecords(year, genre);
    } else {
      items = await Chart.getSongs(year, genre, PAGE_SIZE, offset);
      count = await Chart.countSongs(year, genre);
    }

    res.json({ items, total: count.total, page, totalPages: Math.ceil(count.total / PAGE_SIZE), pageSize: PAGE_SIZE });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getYears = async (req, res) => {
  try {
    const rows = await Chart.getYears();
    res.json(rows.map(r => r.year));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
