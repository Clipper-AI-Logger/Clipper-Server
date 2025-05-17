import axios from 'axios';

const baseURL = import.meta.env.VITE_DEV === "0" ? "http://127.0.0.1:8000" : "/api";

export async function uploadVideos(subtitle, email, titile, uploadedFiles, bgm, color, introTitle) {

	const metaData = {
		subtitle,
		email: email,
		title: titile,
		bgm,
		color,
		introTitle,
		videos: uploadedFiles.map(({ name }) => ({ name, })),
	};

	const formData = new FormData();

	formData.append("data", JSON.stringify(metaData));

	uploadedFiles.forEach(({ file }) => {
		formData.append("files", file);
	});

	const response = await axios.post(baseURL + "/edit/upload", formData);
	return response.data;
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

	const response = await axios.post(baseURL + "/premium/modify", formData);
	return response.data;
}
