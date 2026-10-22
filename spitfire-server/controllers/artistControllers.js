const Artist = require("../models/artistModel");

exports.create = async (req, res) => {
    try {
        const {artname, image, birthDate, country, bio} = req.body;
        
        if (!artname) {
            return res.status(400).json({ message: "Creating a new artist requires a name"});
        }
        
        const artist = await Artist.create(artname, image, birthDate, country, bio);
        res.status(201).json(artist);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }     
}

exports.findArtistbyName = async (req, res) => {
    try {
        const artname = req.params.artname;

        if (!artname) {
            return res.status(400).json({ message: "Invalid name"});
        }

        const artists = await Artist.findByArtname(artname);
        res.json(artists);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

exports.findArtistbyID = async (req, res) => {
    try {
        const ID = req.params.artId;

        if (!ID) {
            return res.status(400).json({message: "Invalid ID"});
        }

        const artist = await Artist.findById(ID);

        if (!artist) {
            return res.status(404).json({ message: "Artist not found" });
        }

        res.json(artist);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

exports.search = async (req, res) => {
    try {
        const text = req.query.q;

        if (!text) {
            return res.json([]);
        }

        const artists = await Artist.search(text);
        res.json(artists);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
