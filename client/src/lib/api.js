import axios from 'axios';
import * as tus from 'tus-js-client';

const baseURL = import.meta.env.VITE_DEV === '0' ? 'http://127.0.0.1:8000' : '/api';

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
            endpoint: import.meta.env.VITE_DEV === '0' 
                ? 'http://127.0.0.1:8000/edit/upload'
                : 'https://clippergpt.com/api/edit/upload',
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

export async function uploadVideos(subtitle, email, prompt, uploadedFiles, bgm, color, introTitle) {
    try {
        const metadata = { subtitle, email, prompt, bgm, color, introTitle };
        
        const uploadPromises = uploadedFiles.map(({ file }) => {
            return createTusUpload(file, metadata);
        });

        const uploadUrls = await Promise.all(uploadPromises);
        
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
        return response.data;
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
