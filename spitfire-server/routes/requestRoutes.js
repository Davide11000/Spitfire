const express = require("express");
const router = express.Router();
const requestController = require("../controllers/requestControllers");
const authMiddleware = require("../middleware/authMiddleware");
const requestUploadMiddleware = require("../middleware/requestUploadMiddleware");
const adminMiddleware = require("../middleware/adminMiddleware");

// Richieste di aggiunta di canzoni, album e artisti (serve il login)
// I dati arrivano come form-data, perché insieme può esserci l'immagine
router.post("/", authMiddleware, requestUploadMiddleware, requestController.create);
router.get("/me", authMiddleware, requestController.getMyRequests);

router.get("/", authMiddleware, adminMiddleware, requestController.getPendingRequests);
router.post("/:id/accept", authMiddleware, adminMiddleware, requestController.accept);
router.post("/:id/reject", authMiddleware, adminMiddleware, requestController.reject);

module.exports = router;
