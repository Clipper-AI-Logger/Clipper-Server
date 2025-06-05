const fs = require('fs');
const fsPromises = require('fs').promises;
const path = require('path');
const FormData = require('form-data');
const axios = require('axios');
const os = require('os');

const AIServerURL = "http://52.79.149.17:8000/files"

// 지원하는 비디오 포맷과 MIME 타입 매핑
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

    async sendFile(videos, bgm, color, introTitle) {
        const formData = new FormData();
        
        formData.append('reqId', this.reqId);
        formData.append('ttype', 1);
        formData.append('prompt', this.prompt || '');
        formData.append('email', this.email);
        formData.append('subtitle', this.subtitle ? 0 : 1);
        formData.append('bgm', bgm.toString());
        formData.append('color', color.toString());
        formData.append('title', introTitle);

        videos.forEach((video, i) => {
            console.log(`비디오 ${i + 1} 처리 중:`, {
                filename: video.filename,
                size: video.data.length
            });

            formData.append('videos', video.data, {
                filename: video.filename,
                contentType: 'video/*'
            });
        });

        try {

            console.log('formData debug : ', formData._streams);

            // 비동기로 요청을 보내고 즉시 응답
            axios.post(AIServerURL, formData, {
                headers: {
                    ...formData.getHeaders(),
                    'Content-Type': 'multipart/form-data'
                },
                maxContentLength: Infinity,
                maxBodyLength: Infinity,
                onUploadProgress: (progressEvent) => {
                    const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                    console.log(`전체 업로드 진행률: ${percentCompleted}%`);
                }
            }).then(response => {
                console.log('AI server 작업 완료:', response.data);
            }).catch(error => {
                console.error('AI server 작업 실패:', error);
            });

            return true;

        } catch (error) {

            if (error.code === 'ECONNABORTED') {
                console.error('Request timeout - 서버 응답 시간이 초과되었습니다.');
                throw new Error('서버 응답 시간이 초과되었습니다. 잠시 후 다시 시도해주세요.');

            } else if (error.code === 'ERR_NETWORK') {
                console.error('Network error - 서버에 연결할 수 없습니다.');
                throw new Error('서버에 연결할 수 없습니다. 서버 상태를 확인해주세요.');

            } else {
                console.error('Error setting up request:', error.message);
                throw new Error(`요청 설정 중 오류 발생: ${error.message}`);
            }
        }
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
                await fsPromises.unlink(videoPath);
                console.log(`Deleted file: ${videoPath}`);
            } catch (error) {
                console.error(`Error deleting file ${videoPath}:`, error);
            }
        }
    }
}