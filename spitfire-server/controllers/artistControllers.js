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

exports.getGenres = async (req, res) => {
  try {
    res.json(await Artist.findGenres(req.params.artId));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getDiscography = async (req, res) => {
  try {
    res.json(await Artist.findDiscography(req.params.artId));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Top songs a pagine di 10 (il "Load more" chiede la pagina successiva)
exports.getTopSongs = async (req, res) => {
  try {
    const limit = 10;
    let page = Number(req.query.page);
    if (!page || page < 1) page = 1;

    const songs = await Artist.findTopSongs(req.params.artId, limit, (page - 1) * limit);
    const total = await Artist.countSongs(req.params.artId);
    res.json({ songs, total, page });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
