const fs = require('fs');
const path = require('path');
const uploadDir = path.join(__dirname, '../..', 'uploads');
const Video = require('../service/video-service.js');
const EditLog = require('../service/editLog-service.js');
const EC2Manager = require('../util/ec2-manager.js');
const { v4: uuidv4 } = require('uuid');

module.exports.uploadVideos = async (req, res) => {

    try {
        const reqId = uuidv4();
        const { email, subtitle, prompt, bgm, color, introTitle, uploadUrls } = req.body;

        console.log("[+] 업로드된 데이터")
        console.log("email: ", email)
        console.log("subtitle: ", subtitle)
        console.log("prompt: ", prompt)
        console.log("bgm: ", bgm)
        console.log("color: ", color)
        console.log("introTitle: ", introTitle)
        console.log("uploadUrls: ", uploadUrls)

        if (!email || !bgm || !color || !introTitle || !uploadUrls) {
            return res.status(400).json({ success: false, message: '모든 필드를 입력하고 최소 하나의 동영상을 업로드해주세요.' });
        }

        const videoPaths = uploadUrls.map(url => {
            const fileName = url.split('/').pop();
            return path.join(uploadDir, fileName);
        });

        processVideoInBackground(reqId, email, subtitle, prompt, videoPaths, bgm, color, introTitle)

        return res.status(200).json({ success: true, message: '편집이 시작되었습니다' });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, message: '파일 업로드 중 오류가 발생했습니다.' });
    }
};


async function processVideoInBackground(reqId, email, subtitle, prompt, videoPaths, bgm, color, introTitle) {
    
    const videoService = new Video(reqId, email, prompt, subtitle);
    const editLogService = new EditLog();
    const ec2Manager = new EC2Manager();

    try {

        const videos = await videoService.readFiles(videoPaths);
        const sendVideoResult = await videoService.saveFileToS3(videos, bgm, color, introTitle);
        const editLogResult = await editLogService.saveEditLog(reqId, email, introTitle);

        // const sendVideoResult = true;
        // const editLogResult = true;

        if (!sendVideoResult || !editLogResult) {
            return res.status(500).json({ success: false, message: '영상 업로드 또는 편집 기록 저장 실패.' });
        }

        await ec2Manager.startInstance();
        
    } catch (error) {
        console.error('백그라운드 처리 에러:', reqId, error);
    } finally {
        await videoService.deleteFile(videoPaths);
        console.log("================================================\n")
    }
}