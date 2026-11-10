const Contribution = require("../models/contributionModel");

exports.getContributors = async (req, res) => {
    try {
        const { type, id } = req.params;

        if (type === "annotation") {
            return res.json(await Contribution.findByAnnotation(id));
        }

        if (type === "about") {
            return res.json(await Contribution.findByAbout(id));
        }

        if (type !== "song" && type !== "record" && type !== "artist") {
            return res.status(400).json({ message: "Invalid type" });
        }

        res.json(await Contribution.findByEntity(type, id));
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
