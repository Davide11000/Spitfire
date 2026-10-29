const Lyrics = require("../models/lyricsModel");
const Song = require("../models/songModel");

exports.create = async (req, res) => {
    try {
        const { songid, language, lyrics } = req.body;

        if (!songid || !language || !lyrics) {
            return res.status(400).json({ message: "Song ID, language and lyrics are required" });
        }

        const song = await Song.findById(songid);
        if (!song) {
            return res.status(404).json({ message: "Song not found" });
        }

        const existing = await Lyrics.findBySongId(songid);
        if (existing.some(l => l.language === language)) {
            return res.status(400).json({ message: "This song already has lyrics in this language" });
        }

        const result = await Lyrics.create(songid, language, lyrics);
        res.status(201).json(result);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.findLyricsBySongId = async (req, res) => {
    try {
        const songid = req.params.songid;

        if (!songid) {
            return res.status(400).json({ message: "You need the song's ID to find its lyrics"});
        }

        const lyrics = await Lyrics.findBySongId(songid);
        res.json(lyrics);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
