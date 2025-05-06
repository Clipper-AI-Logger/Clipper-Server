import axios from 'axios';

const baseURL = import.meta.env.VITE_DEV === "0" ? "http://127.0.0.1:8000" : "/api";


export async function verifyUser(email) {
	const response = await axios.get(baseURL + `/premium/verifyUser/${email}`);
    return response.data.success
}

export async function verifySchool(email, verificationCode) {
	const response = await axios.post(baseURL + `/premium/verifySchool/`, {
		email: email,
		verificationCode: verificationCode
	});
    return response.data.success
}

export async function getHistory(email) {

	const response = await axios.get(baseURL + `/premium/history/${email}`);
    if (response.data.success !== true) {
        return []
    }
	return response.data.history;
}

export async function deleteHistory(uuid) {

	const response = await axios.get(baseURL + `/premium/deleteHistory/${uuid}`);
	return response.data.message;
}
