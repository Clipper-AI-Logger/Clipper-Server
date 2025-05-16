const express = require("express");
const aiController = require("../controllers/ai-controller.js");
const router = express.Router();

router.post("/addList", aiController.addList);

module.exports = router;