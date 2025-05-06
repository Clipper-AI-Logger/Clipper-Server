const fs = require('fs').promises;
const path = require('path');
const FormData = require('form-data');
const { v4: uuidv4 } = require('uuid');
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
const dataURL = "http://localhost"

module.exports = class Video {
    
    constructor(email, title, subtitle, corrections, plus, minus) {
        this.email = email;
        this.title = title;
        this.subtitle = subtitle;
        this.corrections = corrections;
        this.plus = plus; 
        this.minus = minus;
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

    async sendFile(videos) {
        const formData = new FormData();
        const reqId = uuidv4();
        
        formData.append('emails', this.email);
        formData.append('subtitle', this.title);
        formData.append('subtitle', this.subtitle);
        formData.append('reqId', reqId);
      
        videos.forEach((video, i) => {
            formData.append('videos', video.data, { filename: video.filename });
        });

        console.log('formData emails : ', formData._streams);

        try {
            await fetch('http://34.64.57.87:8000/files', {
                method: 'POST',
                body: formData
            });

            await fetch(`${dataURL}/add-list`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    uuid: reqId,
                    nlp_list: [],
                    cv_list: []
                })
            });
        } catch (error) {
            console.log("Error while sending Data to AI server or adding to list:", error);
        }
        
        return true;
    }

    async sendFileForModify(videos, uuid) {

        const formData = new FormData();

        formData.append('emails', this.email);
        formData.append('title', this.title);
        formData.append('uuid',uuid);
        formData.append('subtitle', this.subtitle);
        formData.append('corrections', this.corrections);
        formData.append('plus', this.plus);
        formData.append('minus', this.minus);
        formData.append('reqId', uuidv4());
      
        videos.forEach((video, i) => {
            formData.append('videos', video.data, { filename: video.filename });
        });

        console.log('formData emails : ', formData._streams);

        // try {
        //     await fetch('http://34.64.57.87:8000/files', {
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
                await fs.unlink(videoPath);
                console.log(`Deleted file: ${videoPath}`);
            } catch (error) {
                console.error(`Error deleting file ${videoPath}:`, error);
            }
        }
    }
}