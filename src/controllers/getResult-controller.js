const GetResult = require('../service/getResult-service');

module.exports.uploadZip = async (req, res, next) => {
    if (!req.file) {
        return res.status(400).json({ 
            success: false, 
            message: '파일이 없습니다.' 
        });
    }

    try {
        const getResultService = new GetResult();
        const result = await getResultService.saveZipFile(req.file);
        
        if (!result.success) {
            return res.status(400).json(result);
        }

        return res.status(200).json(result);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ 
            success: false, 
            message: '파일 업로드 중 오류가 발생했습니다.' 
        });
    }
};

module.exports.downloadZip = async (req, res, next) => {
    const { fileName } = req.params;
    
    if (!fileName) {
        return res.status(400).json({ 
            success: false, 
            message: '파일명이 필요합니다.' 
        });
    }

    try {
        const getResultService = new GetResult();
        const result = await getResultService.getZipFile(fileName);
        
        if (!result.success) {
            return res.status(404).json(result);
        }

        res.setHeader('Content-Type', 'application/zip');
        res.setHeader('Content-Disposition', `attachment; filename=${fileName}`);
        return res.send(result.fileBuffer);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ 
            success: false, 
            message: '파일 다운로드 중 오류가 발생했습니다.' 
        });
    }
}; 