const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

class GetResult {
    constructor() {
        this.resultDir = path.join(__dirname, '../../result');
        this.ensureResultDirectory();
    }

    ensureResultDirectory() {
        if (!fs.existsSync(this.resultDir)) {
            fs.mkdirSync(this.resultDir, { recursive: true });
        }
    }

    async saveZipFile(file) {
        try {
            if (!file) {
                return { success: false, message: '파일이 없습니다.' };
            }

            const fileExtension = path.extname(file.originalname);
            if (fileExtension !== '.zip') {
                return { success: false, message: 'zip 파일만 업로드 가능합니다.' };
            }

            const fileName = `${uuidv4()}.zip`;
            const filePath = path.join(this.resultDir, fileName);

            await fs.promises.writeFile(filePath, file.buffer);
            
            return {
                success: true,
                message: '파일이 성공적으로 저장되었습니다.',
                fileName: fileName
            };
        } catch (error) {
            console.error('Error saving zip file:', error);
            return { success: false, message: error.message };
        }
    }

    async getZipFile(fileName) {
        try {
            const filePath = path.join(this.resultDir, fileName);
            
            if (!fs.existsSync(filePath)) {
                return { success: false, message: '파일을 찾을 수 없습니다.' };
            }

            const fileBuffer = await fs.promises.readFile(filePath);
            return {
                success: true,
                fileBuffer: fileBuffer,
                fileName: fileName
            };
        } catch (error) {
            console.error('Error getting zip file:', error);
            return { success: false, message: error.message };
        }
    }
}

module.exports = GetResult;
