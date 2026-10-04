const Artist = require("../models/artistModel");

exports.create = async (req, res) => {
    try {
        const {artname, id} = req.body;
        
        if (!artname || !id) {
            return res.status(400).json({ message: "Creating a new artist require a name and an ID"});
        }
        
        const user = await Artist.create(artname, id);
        res.status(201).json(user);
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
        res.status(201).json(artists);
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

        const artists = await Artist.findById(ID);
        res.status(201).json(artists);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}