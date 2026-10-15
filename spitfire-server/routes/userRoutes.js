const express = require("express");
const router = express.Router();
const userController = require("../controllers/userControllers");

router.get("/:username", userController.getUserByUsername);
router.get("/:username", userController.getUserRole);

module.exports = router;