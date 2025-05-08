import axios from "axios";
import { handleRequestError, logout } from "../auth/AuthService";
import { Entidad } from "../interfaces/IEntidad";
import { IApiResponse } from "../interfaces/IApiResponse"; 

const { VITE_AUTH_BASE_URL, VITE_TOKEN } = import.meta.env;

const BASE_URL = `${VITE_AUTH_BASE_URL}/entidades`;

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

export const saveOrUpdate = async (data: Omit<Entidad, 'id'>): Promise<Entidad | undefined> => {
  try {
    const response = await instance.post<Entidad>('/', data, { headers: getToken() });
    return response.data;
  } catch (error: any) {
    handleRequestError(error);
  }
};

export const getList = async (queryString?: string): Promise<{ rows: Entidad[]; count: number; page: number; limit: number; totalPages: number }|undefined> => {
  try {
    const response = await instance.get<IApiResponse<Entidad>>(`?${queryString}`, { headers: getToken() });
    if (response.data && response.data.data) {
      return {
        rows: response.data.data.data,
        count: response.data.data.total,
        page: response.data.data.page,
        limit: response.data.data.limit,
        totalPages: response.data.data.totalPages,
      };
    }
  } catch (error: any) {
    handleRequestError(error);
  }
};

export const get = async (id: string): Promise<Entidad | undefined> => {
  try {
    const response = await instance.get<Entidad>(`/${id}`, { headers: getToken() });
    return response.data;
  } catch (error: any) {
    handleRequestError(error);
  }
}; 

export const remove = async (id: string): Promise<string | undefined> => {
  try {
    const response = await instance.delete<string>(`/${id}`, { headers: getToken() });
    return response.data;
  } catch (error: any) {
    handleRequestError(error);
  }
};
 