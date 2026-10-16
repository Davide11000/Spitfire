const multer = require("multer");
const path = require("path");

// Salva le foto in uploads/profiles con il nome username-ora.estensione
// (l'ora serve a dare a ogni foto nuova un nome diverso, così il browser non mostra quella vecchia)
const storage = multer.diskStorage({
    destination: "uploads/profiles",
    filename: (req, file, cb) => {
        const extension = path.extname(file.originalname);
        cb(null, req.user.username + "-" + Date.now() + extension);
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith("image/")) cb(null, true);
        else cb(new Error("Only images are allowed"));
    }
});

// Il file arriva nel campo "photo"
module.exports = upload.single("photo");
