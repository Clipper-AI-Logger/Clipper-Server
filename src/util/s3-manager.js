const { S3Client, PutObjectCommand, DeleteObjectCommand, ListObjectsV2Command } = require('@aws-sdk/client-s3');
const { Upload } = require("@aws-sdk/lib-storage");
const fs = require('fs');
const fsPromises = require('fs').promises;
const path = require('path');
const archiver = require('archiver');
const { v4: uuidv4 } = require('uuid');

class S3Manager {
    static globalState = null;

    static setGlobalState(state) {
        S3Manager.globalState = state;
    }

    constructor() {
        this.s3Client = new S3Client({
            credentials: {
                accessKeyId: process.env.AWS_ACCESS_KEY_ID,
                secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
            },
            region: process.env.AWS_REGION
        });
        this.bucketName = process.env.AWS_S3_BUCKET;
    }

    async getNextFolderNumber() {
        while (S3Manager.globalState.isGettingFolderNumber()) {
            await new Promise(resolve => setTimeout(resolve, 100));
        }

        try {
            S3Manager.globalState.setIsGettingFolderNumber(true);
            const nextNumber = S3Manager.globalState.getCurrentFolderNumber() + 1;
            S3Manager.globalState.setCurrentFolderNumber(nextNumber);
            return nextNumber;
        } finally {
            S3Manager.globalState.setIsGettingFolderNumber(false);
        }
    }

    async uploadFiles(files, metadata) {

        let folderNumber;
        try {
            
            console.log("[+] S3 업로드 시작")

            folderNumber = await this.getNextFolderNumber();
            
            const tempDir = path.join(__dirname, '../../temp', uuidv4());
            await fsPromises.mkdir(tempDir, { recursive: true });

            const metadataPath = path.join(tempDir, 'metadata.json');
            await fsPromises.writeFile(metadataPath, JSON.stringify(metadata, null, 2));

            for (const file of files) {
                const filePath = path.join(tempDir, path.basename(file.filename));
                await fsPromises.writeFile(filePath, file.data);
            }

            const folderPath = 'uploadVideos/';
            const zipFileName = `${String(folderNumber).padStart(3, '0')}.zip`;
            const zipFilePath = path.join(__dirname, "../../uploads", zipFileName);

            const output = fs.createWriteStream(zipFilePath);
            const archive = archiver('zip', { zlib: { level: 9 } });
            archive.pipe(output);
            archive.directory(tempDir, false);
            await archive.finalize();

            const upload = new Upload({
                client: this.s3Client,
                params: {
                    Bucket: this.bucketName,
                    Key: folderPath + zipFileName,
                    Body: fs.createReadStream(zipFilePath),
                    ContentType: 'application/zip'
                }
            });

            const uploadResult = await upload.done();
            console.log('[+] S3 업로드 완료', uploadResult);

            await fsPromises.rm(tempDir, { recursive: true, force: true });
            await fsPromises.rm(zipFilePath, { recursive: true, force: true });

            return {
                success: true,
                metadata: metadata
            };

        } catch (error) {
            console.error('[-] S3 업로드 중 오류 발생:', error);
            throw new Error('파일 업로드 중 오류가 발생했습니다.');
        }
    }

    async deleteFile(key) {
        try {
            const params = {
                Bucket: this.bucketName,
                Key: key
            };
            await this.s3Client.send(new DeleteObjectCommand(params));
            return true;
        } catch (error) {
            console.error('[-] S3 파일 삭제 중 오류:', error);
            throw error;
        }
    }

    async listFiles(prefix) {
        try {
            const params = {
                Bucket: this.bucketName,
                Prefix: prefix
            };
            const data = await this.s3Client.send(new ListObjectsV2Command(params));
            return data.Contents;
        } catch (error) {
            console.error('[-] S3 파일 목록 조회 중 오류:', error);
            throw error;
        }
    }
}

module.exports = S3Manager; 