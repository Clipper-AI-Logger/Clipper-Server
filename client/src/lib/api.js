import axios from 'axios';
import * as tus from 'tus-js-client';

const baseURL = '/api';

const api = axios.create({
    baseURL,
    timeout: 600000,
    headers: { 'Content-Type': 'multipart/form-data' },
    maxContentLength: Infinity,
    maxBodyLength: Infinity,
});

const jsonApi = axios.create({
    baseURL,
    timeout: 600000,
    headers: { 'Content-Type': 'application/json' },
});

const createTusUpload = (file, metadata) => {
    return new Promise((resolve, reject) => {
        const upload = new tus.Upload(file, {
            endpoint: `${baseURL}/edit/upload`,
            chunkSize: 5 * 1024 * 1024,
            retryDelays: [0, 1000, 3000],
            metadata: {
                data: JSON.stringify(metadata),
                filename: file.name,
                filetype: file.type
            },
            onProgress: (bytesUploaded, bytesTotal) => {
                const percentCompleted = Math.round((bytesUploaded * 100) / bytesTotal);
                console.log(`업로드 진행률: ${percentCompleted}%`);
            },
            onError: (error) => {
                console.error('업로드 에러:', error);
                reject(error);
            },
            onSuccess: () => {
                console.log('업로드 성공:', upload.url);
                resolve(upload.url);
            }
        });
        upload.start();
    });
};

export async function uploadVideos(subtitle, email, prompt, uploadedFiles, bgm, color, introTitle, onProgress) {
    try {
        const metadata = { subtitle, email, prompt, bgm, color, introTitle };
        
        let totalProgress = 0;
        const progressPerFile = 100 / uploadedFiles.length;
        
        const uploadPromises = uploadedFiles.map(({ file }, index) => {
            return new Promise((resolve, reject) => {
                const upload = new tus.Upload(file, {
                    endpoint: `${baseURL}/edit/upload`,
                    chunkSize: 5 * 1024 * 1024,
                    retryDelays: [0, 1000, 3000],
                    metadata: {
                        data: JSON.stringify(metadata),
                        filename: file.name,
                        filetype: file.type
                    },
                    onProgress: (bytesUploaded, bytesTotal) => {
                        const fileProgress = Math.round((bytesUploaded * 100) / bytesTotal);
                        const currentFileProgress = (fileProgress * progressPerFile) / 100;
                        const overallProgress = Math.round(
                            (index * progressPerFile) + currentFileProgress
                        );
                        
                        if (onProgress) {
                            onProgress(overallProgress);
                        }
                        
                        console.log(`파일 ${index + 1} 업로드 진행률: ${fileProgress}%`);
                        console.log(`전체 진행률: ${overallProgress}%`);
                    },
                    onError: (error) => {
                        console.error('업로드 에러:', error);
                        reject(error);
                    },
                    onSuccess: () => {
                        console.log('업로드 성공:', upload.url);
                        resolve(upload.url);
                    }
                });
                upload.start();
            });
        });

        const uploadUrls = await Promise.all(uploadPromises);
        
        if (onProgress) {
            onProgress(100);
        }
        
        const response = await jsonApi.post('/edit/process', {
            email,
            subtitle,
            prompt,
            bgm,
            color,
            introTitle,
            uploadUrls
        });

        return response.data;

    } catch (error) {
        console.error('업로드 에러:', error);
        throw error;
    }
}

export async function uploadModifyVideos(subtitle, email, title, uuid, corrections, plus, minus, uploadedFiles) {
	const metaData = {
		subtitle,
		email: email,
		title: title,
		uuid: uuid,
		corrections: corrections,
		plus: plus,
		minus: minus,
		videos: uploadedFiles.map(({ name }) => ({ name, })),
	};

	const formData = new FormData();

	formData.append("data", JSON.stringify(metaData));

	uploadedFiles.forEach(({ file }) => {
		formData.append("files", file);
	});

	const response = await api.post("/premium/modify", formData);
	return response.data;
}
