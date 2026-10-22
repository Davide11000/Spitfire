const express = require("express");
const router = express.Router();
const requestController = require("../controllers/requestControllers");
const authMiddleware = require("../middleware/authMiddleware");
const requestUploadMiddleware = require("../middleware/requestUploadMiddleware");

// Richieste di aggiunta di canzoni, album e artisti (serve il login)
// I dati arrivano come form-data, perché insieme può esserci l'immagine
router.post("/", authMiddleware, requestUploadMiddleware, requestController.create);
router.get("/me", authMiddleware, requestController.getMyRequests);

module.exports = router;
