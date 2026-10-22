const Lyrics = require("../models/lyricsModel");

exports.create = async (req, res) => {
    try {
        const lyricsObj = {
            lyrics: req.params.lyrics,
            language: req.params.language,
            songid: req.params.songid
        };

        if (!lyricsObj) {
            return res.status(400).json({ message: "Invalid request"});
        }

        const lyrics = await Lyrics.create(lyricsObj.songid, lyricsObj.language, lyricsObj.lyrics);

        res.status(201).json(lyrics);
    } catch (error) {
        res.status(500).json({ error: err.message });
    }  
}

exports.findLyricsBySongId = async (req, res) => {
    try {
        const songid = req.params.songid;

        if (!songid) {
            return res.status(400).json({ message: "You need the song's ID to find its lyrics"});
        }

        const lyrics = await Lyrics.findBySongId(songid);

        res.status(201).json(lyrics);
    } catch (error) {
        res.status(500).json({error: err.message});
    }
}