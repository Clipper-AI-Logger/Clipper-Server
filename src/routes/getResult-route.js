const express = require('express');
const router = express.Router();
const multer = require('multer');
const getResultController = require('../controllers/getResult-controller');

const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 500 * 1024 * 1024 
    }
});

router.post('/upload', upload.single('file'), getResultController.uploadZip);
router.get('/download/:fileName', getResultController.downloadZip);

module.exports = router; 