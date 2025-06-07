const Video = require('../service/video-service.js');
const EditLog = require('../service/editLog-service.js');
const EC2Manager = require('../util/ec2-manager.js');
const { v4: uuidv4 } = require('uuid');

module.exports.uploadVideos = async (req, res, next) => {
    
    const reqId = uuidv4();
    const ec2Manager = new EC2Manager();

    const { email, subtitle, prompt, bgm, color, introTitle, videos: videoInfo } = JSON.parse(req.body.data);

    if (!email || !subtitle || !bgm || !color || !introTitle || !Array.isArray(videoInfo) || videoInfo.length === 0) {
        return res.json({ success: false, message: '입력 필드를 모두 입력해주세요' });
    }
    if (!req.files || req.files.length === 0) {
        return res.json({ success: false, message: '최소 하나 이상의 동영상이 필요합니다.' });
    }

    let videoPaths = req.files.map(file => file.path);
    
    const videoService = new Video(reqId, email, prompt, subtitle);

    try {
        
        // Send Video & metadatas to S3 bucket
        const videos = await videoService.readFiles(videoPaths);
        const sendVideoResult = await videoService.saveFileToS3(videos, bgm, color, introTitle);

        // save data in database
        const editLogService = new EditLog();
        const editLogResult = await editLogService.saveEditLog(reqId, email, introTitle);

        if (sendVideoResult && editLogResult) {

            // generate EC2 Instance to run AI
            console.log('EC2 인스턴스 시작 시도');
            const ec2Result = await ec2Manager.startInstance();
            console.log('EC2 인스턴스 시작 결과:', ec2Result);

            return res.status(200).json({ 
                success: true, 
                message: '편집이 시작되었습니다',
                ec2Status: ec2Result
            });
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
