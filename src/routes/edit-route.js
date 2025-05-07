const express = require("express");
const editController = require("../controllers/edit-controller.js");
const { uploadFiles } = require("../util/middleware.js");
const router = express.Router();

router.post("/upload", uploadFiles, editController.uploadVideos);

module.exports = router;
