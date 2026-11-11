const multer = require("multer");
const path = require("path");

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

module.exports = upload.single("photo");
