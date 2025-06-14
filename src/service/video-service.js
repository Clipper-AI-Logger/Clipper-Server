const fsPromises = require('fs').promises;
const path = require('path');
const FormData = require('form-data');
const S3Manager = require('../util/s3-manager');

const VIDEO_MIME_TYPES = {
    '.mp4': 'video/mp4',
    '.mov': 'video/quicktime',
    '.avi': 'video/x-msvideo',
    '.wmv': 'video/x-ms-wmv',
    '.flv': 'video/x-flv',
    '.webm': 'video/webm',
    '.mkv': 'video/x-matroska',
    '.m4v': 'video/x-m4v',
    '.3gp': 'video/3gpp',
    '.mpeg': 'video/mpeg',
    '.mpg': 'video/mpeg'
};

module.exports = class Video {
    
    constructor(reqId, email, prompt, subtitle) {
        this.reqId = reqId;
        this.email = email;
        this.prompt = prompt;
        this.subtitle = subtitle;
        this.s3Manager = new S3Manager();
    }

    async readFiles(videoPaths) {
        const filesData = [];
        for (const videoPath of videoPaths) {
            try {
                const fileData = await fsPromises.readFile(videoPath);
                const fileName = path.basename(videoPath); 
                filesData.push({ filename: fileName, data: fileData });
            } catch (error) {
                console.error(`Error reading file ${videoPath}:`, error);
            }
        }
        return filesData;
    }

    getMimeType(filename) {
        const ext = path.extname(filename).toLowerCase();
        return VIDEO_MIME_TYPES[ext] || 'application/octet-stream';
    }

    async saveFileToS3(videos, bgm, color, introTitle) {

        try {
            const metadata = {
                reqId: this.reqId,
                email: this.email,
                prompt: this.prompt,
                subtitle: this.subtitle,
                ttype: 1,
                bgm: bgm,
                color: color,
                introTitle: introTitle,
                timestamp: new Date().toISOString()
            };

            await this.s3Manager.uploadFiles(videos, metadata);
            return true

        } catch (error) {
            console.error('비디오 저장 중 오류:', error);
            throw error;
        }
    }


    async sendFileForModify(videos, uuid, introTitle, corrections, plus, minus) {

        const formData = new FormData();

        formData.append('reqId', this.reqId);
        formData.append('email', this.email);
        formData.append('title', introTitle);
        formData.append('uuid', uuid);
        formData.append('subtitle', this.subtitle);
        formData.append('corrections', corrections);
        formData.append('plus', plus);
        formData.append('minus', minus);

        videos.forEach((video, i) => {
            formData.append('videos', video.data, { filename: video.filename });
        });

        // try {
        //     console.log('formData emails : ', formData._streams);
        //     await fetch(AIServerURL, {
        //         method: 'POST',
        //         body: formData
        //     });
        // } catch {
        //     console.log("Error while sending Data to AI server")
        // }
        
        return true;
    }

    async deleteFile(videoPaths) {
        for (const videoPath of videoPaths) {
            try {
                const metadataPath = `${videoPath}.json`;
                await fsPromises.unlink(videoPath);
                await fsPromises.unlink(metadataPath);
                console.log(`File deleted: ${videoPath}`);
            } catch (error) {
                console.error(`Error deleting file ${videoPath}:`, error);
            }
        }
    }
}