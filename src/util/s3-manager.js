const AWS = require('aws-sdk');
const fs = require('fs');
const fsPromises = require('fs').promises;
const path = require('path');
const archiver = require('archiver');
const { v4: uuidv4 } = require('uuid');

class S3Manager {
    constructor() {
        this.s3 = new AWS.S3({
            accessKeyId: process.env.AWS_ACCESS_KEY_ID,
            secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
            region: process.env.AWS_REGION
        });
        this.currentFolderNumber = null;
        this.bucketName = process.env.AWS_S3_BUCKET;
    }

    async initialize() {
        try {
            const params = {
                Bucket: this.bucketName,
                Prefix: 'uploadVideos/'
            };

            const data = await this.s3.listObjectsV2(params).promise();
            
            const fileNumbers = data.Contents
                .map(item => {
                    const match = item.Key.match(/uploadVideos\/(\d+)\.zip/);
                    return match ? parseInt(match[1]) : 0;
                })
                .filter(num => !isNaN(num));

            this.currentFolderNumber = fileNumbers.length === 0 ? 1 : Math.max(...fileNumbers) + 1;
            return this.currentFolderNumber;
        } catch (error) {
            console.error('S3 초기화 중 오류:', error);
            throw error;
        }
    }

    getNextFolderNumber() {
        if (!this.currentFolderNumber) {
            throw new Error('S3 매니저가 초기화되지 않았습니다.');
        }
        return this.currentFolderNumber.toString().padStart(3, '0');
    }

    incrementFolderNumber() {
        this.currentFolderNumber++;
    }

    async uploadFiles(files, metadata) {
        try {
            console.log('1. 임시 디렉토리 생성');
            const tempDir = path.join(__dirname, '../../temp', uuidv4());
            await fsPromises.mkdir(tempDir, { recursive: true });

            console.log('2. 메타데이터 파일 저장');
            const metadataPath = path.join(tempDir, 'metadata.json');
            await fsPromises.writeFile(metadataPath, JSON.stringify(metadata, null, 2));

            console.log('3. 비디오 파일 저장');
            for (const file of files) {
                const filePath = path.join(tempDir, path.basename(file.filename));
                await fsPromises.writeFile(filePath, file.data);
            }

            console.log('4. 폴더 번호 확인');
            const folderNumber = this.getNextFolderNumber();
            const zipPath = path.join(tempDir, `${folderNumber}.zip`);
            const output = fs.createWriteStream(zipPath);
            const archive = archiver('zip', { zlib: { level: 9 } });

            console.log('5. 압축 시작');
            archive.pipe(output);
            archive.directory(tempDir, false);
            await archive.finalize();

            console.log('6. S3 업로드 준비');
            const uploadParams = {
                Bucket: this.bucketName,
                Key: `uploadVideos/${folderNumber}.zip`,
                Body: fs.createReadStream(zipPath),
                ContentType: 'application/zip'
            };

            console.log('7. S3 업로드 시작');
            const uploadResult = await this.s3.upload(uploadParams).promise();
            console.log('8. S3 업로드 완료', uploadResult);

            this.incrementFolderNumber();
            await fsPromises.rm(tempDir, { recursive: true, force: true });

            return {
                success: true,
                metadata: metadata
            };

        } catch (error) {
            console.error('S3 업로드 중 오류 발생:', error);
            throw new Error('파일 업로드 중 오류가 발생했습니다.');
        }
    }

    async deleteFile(key) {
        try {
            const params = {
                Bucket: this.bucketName,
                Key: key
            };
            await this.s3.deleteObject(params).promise();
            return true;
        } catch (error) {
            console.error('S3 파일 삭제 중 오류:', error);
            throw error;
        }
    }

    async listFiles(prefix) {
        try {
            const params = {
                Bucket: this.bucketName,
                Prefix: prefix
            };
            const data = await this.s3.listObjectsV2(params).promise();
            return data.Contents;
        } catch (error) {
            console.error('S3 파일 목록 조회 중 오류:', error);
            throw error;
        }
    }
}

const s3Manager = new S3Manager();
module.exports = s3Manager; 