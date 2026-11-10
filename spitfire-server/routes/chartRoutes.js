const express = require("express");
const router = express.Router();
const chartController = require("../controllers/chartControllers");

router.get("/", chartController.getChart);
router.get("/years", chartController.getYears);

module.exports = router;
