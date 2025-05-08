import axios from "axios";
import { handleRequestError, logout } from "../auth/AuthService";

const { VITE_AUTH_BASE_URL, VITE_TOKEN } = import.meta.env;

const BASE_URL = `${VITE_AUTH_BASE_URL}/import`; // Cambia la URL base

const instance = axios.create({
  baseURL: BASE_URL,
});

export const getToken = (): any => {
  const token = localStorage.getItem(VITE_TOKEN);
  return token ? { Authorization: `Bearer ${token}` } : null;
};

let isLoggingOut = false;
instance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const status = error.response?.status;
    if ((status === 401 || status === 403) && !isLoggingOut) {
      isLoggingOut = true;
      logout();
    }
    return Promise.reject(error);
  }
);

export const importData = async (file: File): Promise<string | null> => {
  try {
    const formData = new FormData();
    formData.append('archivo', file);
    console.log("FormData antes del envío:", formData);
    console.log("File object:", file);
    const response = await instance.post<string>('/deudores', formData, {
      headers: {
        ...getToken(),
        'Content-Type': 'multipart/form-data',
      },
    });
    console.log("Respuesta del servidor:", response);
    return response.data;
  } catch (error: any) {
    handleRequestError(error);
    return null;
  }
};
