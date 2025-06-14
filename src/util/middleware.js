const path = require('path');
const multer = require('multer');
const fs = require('fs');
const { Server } = require('@tus/server');
const { FileStore } = require('@tus/file-store');
const { v4: uuidv4 } = require('uuid');

const uploadDir = path.join(__dirname, '../..', 'uploads');


if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
}

const MIME_TO_EXT = {
    'video/mp4': '.mp4',
    'video/quicktime': '.mov',
    'video/x-msvideo': '.avi',
    'video/x-ms-wmv': '.wmv',
    'video/x-flv': '.flv',
    'video/webm': '.webm',
    'video/x-matroska': '.mkv',
    'video/x-m4v': '.m4v',
    'video/3gpp': '.3gp',
    'video/mpeg': '.mpeg',
    'video/mpg': '.mpg'
};

const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, uploadDir),
    filename: (req, file, cb) => {
        cb(null, file.originalname);
    },
});

const uploadFiles = multer({ storage: storage }).array('files');

const tusServer = new Server({
    path: '/edit/upload',
    datastore: new FileStore({ directory: uploadDir }),
    respectForwardedHeaders: true,
    namingFunction: (req, metadata) => {
        if (metadata.filename) {
            const ext = MIME_TO_EXT[metadata.filetype] || path.extname(metadata.filename);
            return `${uuidv4()}${ext}`;
        }
        return uuidv4();
    }
});

const tusMiddleware = async (req, res, next) => {
    try {
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'POST, HEAD, PATCH, OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Upload-Length, Upload-Metadata, Upload-Offset, Tus-Resumable');
        res.setHeader('Access-Control-Expose-Headers', 'Upload-Offset, Location, Upload-Length, Tus-Version, Tus-Resumable, Tus-Max-Size, Tus-Extension, Upload-Metadata');
        res.setHeader('Tus-Resumable', '1.0.0');

        if (req.method === 'OPTIONS') {
            return res.status(204).end();
        }

        await tusServer.handle(req, res);
    } catch (error) {
        console.error('TUS 미들웨어 에러:', error);
        res.status(500).json({ error: 'Something went wrong with that request' });
    }
};

module.exports = { uploadFiles, tusServer, tusMiddleware };