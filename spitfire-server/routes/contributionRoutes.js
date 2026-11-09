const express = require("express");
const router = express.Router();
const contributionController = require("../controllers/contributionControllers");

router.get("/:type/:id", contributionController.getContributors);

module.exports = router;
