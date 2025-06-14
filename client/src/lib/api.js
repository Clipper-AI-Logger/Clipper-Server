import axios from 'axios';

const baseURL = import.meta.env.VITE_DEV === '0' ? 'http://127.0.0.1:8000' : '/api';

const api = axios.create({
    baseURL,
    timeout: 600000,
    headers: { 'Content-Type': 'multipart/form-data' },
    maxContentLength: Infinity,
    maxBodyLength: Infinity,
});

export async function uploadVideos(subtitle, email, prompt, uploadedFiles, bgm, color, introTitle) {
	
    const formData = new FormData();
    formData.append('data', JSON.stringify({ subtitle, email, prompt, bgm, color, introTitle }));

    uploadedFiles.forEach(({ file }) => formData.append('files', file));

    try {
        const response = await api.post('/edit/upload', formData, {
            onUploadProgress: (progressEvent) => {
                const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                console.log(`업로드 진행률: ${percentCompleted}%`);
            },
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
