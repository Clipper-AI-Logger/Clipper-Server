const express = require("express");
const premiumController = require("../controllers/premium-controller.js");
const { uploadFiles } = require("../util/middleware.js");
const router = express.Router();

router.post("/verifySchool", premiumController.verifySchool);
router.get("/verifyUser/:email", premiumController.verifyPremium);
router.get("/history/:email", premiumController.getHistory);
router.get("/deleteHistory/:uuid", premiumController.deleteHistory);
router.post("/modify", uploadFiles, premiumController.uploadVideosForModify);

module.exports = router;
