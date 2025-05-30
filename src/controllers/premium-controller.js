const PremiumService = require('../service/premium-service.js');
const Video = require('../service/video-service.js');
const EditLog = require('../service/editLog-service.js');
const { v4: uuidv4 } = require('uuid');
const moment = require('moment-timezone');

module.exports.verifySchool = async (req, res, next) => {

    const { verificationCode, email } = req.body;

    if (!email || !verificationCode) {
        return res.status(400).json({ success: false, message: '이메일과 인증코드를 입력해주세요.' });
    }

    try {
        const premiumService = new PremiumService();
        const verifySchoolResult = await premiumService.verifySchool(verificationCode);

        if (!verifySchoolResult.success) {
            return res.json({ success: false, message: '인증 코드가 유효하지 않습니다.' });
        }

        const emailDomain = email.split('@')[1];
        if (emailDomain !== verifySchoolResult.data.email_domain) {
            return res.json({ success: false, message: '이메일 도메인이 학교 도메인과 일치하지 않습니다.' });
        }

        return res.status(200).json({ 
            success: true, 
            message: `${verifySchoolResult.data.school_name} 인증이 완료되었습니다.` 
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, message: '인증 과정에서 오류가 발생했습니다.' });
    }
};

module.exports.verifyPremium = async (req, res, next) => {

    const { email } = req.params;

    if (!email) {
        return res.status(400).json({ success: false, message: '이메일을 입력해주세요.' });
    }

    try {
        const premiumService = new PremiumService();
        const isVerified = await premiumService.verifyPremiumUser(email);

        if (!isVerified) {
            return res.json({ success: false, message: `${email}은 프리미엄 회원이 아닙니다.` });
        }
        return res.status(200).json({ success: true, message: `${email}은 프리미엄 회원입니다.` });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, message: '인증 과정에서 오류가 발생했습니다.' });
    }
};

module.exports.getHistory = async (req, res, next) => {

    const { email } = req.params;

    if (!email) {
        return res.status(400).json({ success: false, message: '이메일을 입력해주세요.' });
    }

    try {
        const editLogService = new EditLog();
        const history = await editLogService.getEditHistory(email);

        if (history.length === 0) {
            return res.json({ success: false, message: `${email}의 영상 편집 기록이 존재하지 않습니다.` });
        }
        return res.status(200).json({ success: true, history: history });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, message: '편집 기록을 조회하는 중 오류가 발생했습니다.' });
    }
};

module.exports.deleteHistory = async (req, res, next) => {
    
    const { uuid } = req.params;

    if (!uuid) {
        return res.status(400).json({ success: false, message: '삭제할 기록을 찾을 수 없습니다.' });
    }

    try {
        const editLogService = new EditLog();
        const result = await editLogService.deleteHistory(uuid);
        
        if (!result.success) {
            return res.json({ success: false, message: result.message });
        }
        return res.status(200).json({ success: true, message: '영상 편집 기록이 삭제되었습니다.' });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, message: '기록 삭제 중 오류가 발생했습니다.' });
    }
};

module.exports.uploadVideosForModify = async (req, res, next) => {

    const reqId = uuidv4();

    const { email, title, subtitle, uuid, corrections, plus, minus, videos: videoInfo } = JSON.parse(req.body.data);

    let videoPaths = req.files.map(file => file.path);

    if (!email || !title || !uuid || !Array.isArray(videoInfo) || videoInfo.length === 0) {
        return res.json({ success: false, message: '입력 필드를 모두 입력해주세요' });
    }
    if (!req.files || req.files.length === 0) {
        return res.json({ success: false, message: '최소 하나 이상의 동영상이 필요합니다.' });
    }

    const modificationDateTime = moment().tz('Asia/Seoul').format('YYYY-MM-DD HH:mm:ss');
    const modifiedTitle = `${title}(수정_${modificationDateTime})`;
    
    const videoService = new Video(reqId, email, modifiedTitle, subtitle, corrections, plus, minus);

    try {

        const videos = await videoService.readFiles(videoPaths);
        const sendVideoResult = await videoService.sendFileForModify(videos, uuid);

        const editLogService = new EditLog();
        const editLogResult = await editLogService.saveEditLog(reqId, email, modifiedTitle);

        if (sendVideoResult && editLogResult) {
            return res.status(200).json({ success: true, message: '수정이 시작되었습니다' });
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