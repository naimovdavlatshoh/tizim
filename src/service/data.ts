import axios from "axios";
import { handleAuthError } from "../utils/authUtils";

// Add response interceptor to handle 401 errors globally
axios.interceptors.response.use(
    (response) => response,
    (error) => {
        // Handle 401 Unauthorized errors globally
        if (handleAuthError(error)) {
            // Return a resolved promise to prevent further error handling
            // The page will reload automatically
            return Promise.resolve({ data: { handled: true } });
        }
        return Promise.reject(error);
    }
);

export const BASE_URL = "https://apitizim.argon.uz/";

export const Token = localStorage.getItem("token");
export const Role = localStorage.getItem("role");

export const PostData = async (url: string, data: any) => {
    const response = await axios.post(BASE_URL + url, data);
    return response;
};

export const PostDataToken = async (url: string, data: any) => {
    const response = await axios.post(BASE_URL + url, data, {
        headers: {
            "Content-Type": "multipart/formData",
            Authorization: `Bearer ${Token}`,
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

    const response = await axios.post(BASE_URL + url, formData, {
        headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${Token}`,
        },
    });
    return response;
};

export const PostDataTokenJson = async (url: string, data: any) => {
    const response = await axios.post(BASE_URL + url, data, {
        headers: {
            Authorization: `Bearer ${Token}`,
        },
    });
    return response;
};

export const PostSimple = async (url: string) => {
    const response = await axios.post(
        BASE_URL + url,
        {},
        {
            headers: {
                Authorization: `Bearer ${Token}`,
            },
        }
    );
    return response;
};

export const GetDataSimple = async (url: string) => {
    if (Token) {
        const response = await axios.get(BASE_URL + url, {
            headers: {
                Authorization: `Bearer ${Token}`,
            },
        });
        return response.data;
    } else {
        const response = await axios.get(BASE_URL + url);
        return response.data;
    }
};
export const GetDataSimpleUrl = async (url: string) => {
    if (Token) {
        const response = await axios.get(url, {
            headers: {
                Authorization: `Bearer ${Token}`,
            },
        });
        return response.data;
    } else {
        const response = await axios.get(BASE_URL + url);
        return response.data;
    }
};

export const DeleteData = async (url: string) => {
    const response = await axios.delete(BASE_URL + url, {
        headers: {
            Authorization: `Bearer ${Token}`,
        },
    });
    return response;
};
