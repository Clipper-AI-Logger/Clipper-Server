const fs = require('fs').promises;
const path = require('path');
const FormData = require('form-data');
const { v4: uuidv4 } = require('uuid');

module.exports = class Video {
    
    constructor(reqId, email, prompt, subtitle, bgm, color, introTitle) {
        this.reqId = reqId;
        this.email = email;
        this.prompt = prompt;
        this.subtitle = subtitle;
    }

    async readFiles(videoPaths) {
        const filesData = [];
        for (const videoPath of videoPaths) {
            try {
                const fileData = await fs.readFile(videoPath);
                const fileName = path.basename(videoPath); 
                filesData.push({ filename: fileName, data: fileData });
            } catch (error) {
                console.error(`Error reading file ${videoPath}:`, error);
            }
        }
        return filesData;
    }

    async sendFile(videos, bgm, color, introTitle) {
        const formData = new FormData();
        
        formData.append('reqId', this.reqId);
        formData.append('prompt', this.prompt);
        formData.append('email', this.email);
        formData.append('subtitle', this.subtitle);
        formData.append('bgm', bgm);
        formData.append('color', color);
        formData.append('intro_title', introTitle);

        videos.forEach((video, i) => {
            formData.append('videos', video.data, { filename: video.filename });
        });

        try {
            // console.log('formData emails : ', formData._streams);
            // await fetch('http://34.64.57.87:8000/files', {
            //     method: 'POST',
            //     body: formData
            // });

        } catch (error) {
            console.log("Error while sending Data to AI server or adding to list:", error);
        }
        
        return true;
    }

    async sendFileForModify(videos, uuid, corrections, plus, minus) {

        const formData = new FormData();

        formData.append('reqId', this.reqId);
        formData.append('email', this.email);
        formData.append('title', this.title);
        formData.append('uuid', uuid);
        formData.append('subtitle', this.subtitle);
        formData.append('corrections', corrections);
        formData.append('plus', plus);
        formData.append('minus', minus);

        videos.forEach((video, i) => {
            formData.append('videos', video.data, { filename: video.filename });
        });

        try {
            console.log('formData emails : ', formData._streams);
            // await fetch('http://34.64.57.87:8000/files', {
            //     method: 'POST',
            //     body: formData
            // });
        } catch {
            console.log("Error while sending Data to AI server")
        }
        
        return true;
    }

    async deleteFile(videoPaths) {
        for (const videoPath of videoPaths) {
            try {
                await fs.unlink(videoPath);
                console.log(`Deleted file: ${videoPath}`);
            } catch (error) {
                console.error(`Error deleting file ${videoPath}:`, error);
            }
        }
    }
}