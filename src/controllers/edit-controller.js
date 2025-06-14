const Video = require('../service/video-service.js');
const EditLog = require('../service/editLog-service.js');
const EC2Manager = require('../util/ec2-manager.js');
const { v4: uuidv4 } = require('uuid');

module.exports.uploadVideos = async (req, res) => {

    const reqId = uuidv4();
    const { email, subtitle, prompt, bgm, color, introTitle } = JSON.parse(req.body.data);
    const uploadedFiles = req.files;

    if (!email || !subtitle || !bgm || !color || !introTitle || !uploadedFiles || uploadedFiles.length === 0) {
        return res.status(400).json({ success: false, message: '모든 필드를 입력하고 최소 하나의 동영상을 업로드해주세요.' });
    }

    const videoPaths = uploadedFiles.map(file => file.path);
    const videoService = new Video(reqId, email, prompt, subtitle);
    const editLogService = new EditLog();
    const ec2Manager = new EC2Manager();

    try {
        const videos = await videoService.readFiles(videoPaths);
        console.log('videos', videos);
        const sendVideoResult = await videoService.saveFileToS3(videos, bgm, color, introTitle);
        // const sendVideoResult = true;
        const editLogResult = await editLogService.saveEditLog(reqId, email, introTitle);
        // const editLogResult = true;

        if (!sendVideoResult || !editLogResult) {
            return res.status(500).json({ success: false, message: '영상 업로드 또는 편집 기록 저장 실패.' });
        }

        await ec2Manager.startInstance();
        return res.status(200).json({ success: true, message: '편집이 시작되었습니다.' });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: '파일 업로드 중 오류가 발생했습니다.' });
    } finally {
        await videoService.deleteFile(videoPaths);
    }
};