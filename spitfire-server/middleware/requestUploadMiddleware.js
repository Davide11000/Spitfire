const multer = require("multer");
const path = require("path");

// Come uploadMiddleware, ma per le immagini allegate alle richieste (copertine e foto artisti)
const storage = multer.diskStorage({
    destination: "uploads/requests",
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

// Il file arriva nel campo "image"
module.exports = upload.single("image");
