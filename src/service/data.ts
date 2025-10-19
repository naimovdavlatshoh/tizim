import axios from "axios";
import { handleAuthError } from "../utils/authUtils";


axios.interceptors.response.use(
    (response) => response,
    (error) => {
        if (handleAuthError(error)) {
            return Promise.resolve({ data: { handled: true } });
        }
        return Promise.reject(error);
    }
);
export const GetDataSimpleBlob = async (url: string, config: any = {}) => {
    const token = localStorage.getItem("token"); // yoki sessionStorage

    const response = await axios.get(BASE_URL + url, {
        responseType: config.responseType || "json", // blob yoki json
        headers: {
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
            ...config.headers,
        },
        ...config,
    });

    return response.data;
};
export const GetDataSimpleBlobExel = async (url: string, config: any = {}) => {
    const token = localStorage.getItem("token"); // yoki sessionStorage

    const response = await axios.get(BASE_URL + url, {
        responseType: "arraybuffer", // blob yoki json
        headers: {
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
            ...config.headers,
        },
        ...config,
    });

    return response.data;
};

export const BASE_URL = "https://apitizim.argon.uz/";

export const Token = localStorage.getItem("token");
export const Role = localStorage.getItem("role");

export const PostData = async (url: string, data: any) => {
    const response = await axios.post(BASE_URL + url, data);
    return response;
};

export const PostDataToken = async (url: string, data: any) => {
    const token = localStorage.getItem("token");
    const response = await axios.post(BASE_URL + url, data, {
        headers: {
            "Content-Type": "multipart/formData",
            Authorization: `Bearer ${token}`,
        },
    });
    return response;
};

export const PostDocxContract = async (
    url: string,
    contractData: any,
    docxBlob: Blob
) => {
    const formData = new FormData();
    formData.append("contract_file", docxBlob, "shartnoma.docx");
    formData.append("contract_data", JSON.stringify(contractData));

    const token = localStorage.getItem("token");
    const response = await axios.post(BASE_URL + url, formData, {
        headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`,
        },
    });
    return response;
};

export const PostDataTokenJson = async (url: string, data: any) => {
    const token = localStorage.getItem("token");
    const response = await axios.post(BASE_URL + url, data, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });
    return response;
};

export const PostSimple = async (url: string, data: any = {}) => {
    const token = localStorage.getItem("token");
    const response = await axios.post(BASE_URL + url, data, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });
    return response;
};

export const PostSimpleFormData = async (url: string, data: FormData) => {
    const token = localStorage.getItem("token");
    const response = await axios.post(BASE_URL + url, data, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });
    return response;
};

export const GetDataSimple = async (url: string) => {
    const token = localStorage.getItem("token");
    if (token) {
        const response = await axios.get(BASE_URL + url, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        return response.data;
    } else {
        const response = await axios.get(BASE_URL + url);
        return response.data;
    }
};
export const GetDataSimpleUrl = async (url: string) => {
    const token = localStorage.getItem("token");
    if (token) {
        const response = await axios.get(url, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        return response.data;
    } else {
        const response = await axios.get(BASE_URL + url);
        return response.data;
    }
};

export const DeleteData = async (url: string) => {
    const token = localStorage.getItem("token");
    const response = await axios.delete(BASE_URL + url, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });
    return response;
};
