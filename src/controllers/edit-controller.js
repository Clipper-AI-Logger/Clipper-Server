const Video = require('../service/video-service.js');
const EditLog = require('../service/editLog-service.js');
const { v4: uuidv4 } = require('uuid');

module.exports.uploadVideos = async (req, res, next) => {
    const reqId = uuidv4();

    const { email, subtitle, title, videos: videoInfo } = JSON.parse(req.body.data);

    if (!email || !title || !Array.isArray(videoInfo) || videoInfo.length === 0) {
        return res.json({ success: false, message: '입력 필드를 모두 입력해주세요' });
    }
    if (!req.files || req.files.length === 0) {
        return res.json({ success: false, message: '최소 하나 이상의 동영상이 필요합니다.' });
    }

    let videoPaths = req.files.map(file => file.path);
    
    const videoService = new Video(reqId, email, title, subtitle);

    try {
        
        const videos = await videoService.readFiles(videoPaths);
        const sendVideoResult = await videoService.sendFile(videos);

        const editLogService = new EditLog();
        const editLogResult = await editLogService.saveEditLog(reqId, email, title);

        if (sendVideoResult && editLogResult) {
            return res.status(200).json({ success: true, message: '편집이 시작되었습니다' });
        } else {
            return res.json({ success: false, message: '영상이 제대로 업로드되지 않았습니다.' });
        }
        
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: '파일 업로드 중 오류가 발생했습니다.' });
    } 
    finally {
        await videoService.deleteFile(videoPaths);
    }
};
