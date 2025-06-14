const express = require("express");
const editController = require("../controllers/edit-controller.js");
const { tusMiddleware } = require("../util/middleware.js");
const router = express.Router();

router.all("/upload*", tusMiddleware);
router.post("/process", editController.uploadVideos);

module.exports = router;
