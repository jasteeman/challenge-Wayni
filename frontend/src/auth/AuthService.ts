import axios from "axios";

const BASE_URL = import.meta.env.VITE_AUTH_BASE_URL;
const TOKEN_KEY = "accessToken";

export const login = async (credentials: { username: string; password: string }) => {
  try {
    const response = await axios.post(`${BASE_URL}/auth/login`, credentials);
    const { access_token } = response.data.data;
    localStorage.setItem(TOKEN_KEY, access_token);
    return response.data;
  } catch (error) {
    console.error("Error durante el login:", error);
    throw error;
  }
};

export const logout = () => {
  localStorage.removeItem(TOKEN_KEY);
  window.location.reload();
};

export const getToken = (): any => {
  const token = localStorage.getItem(TOKEN_KEY);
  return token ? { Authorization: `Bearer ${token}` } : null;
};

export const isAuthenticated = async (): Promise<boolean> => {
  try {
    const response = await axios.get(`${BASE_URL}/auth/protected`, { headers: getToken() });
    return response.status >= 200 && response.status < 300;
  } catch (error) {
    return false;
  }
};

export const getUserLogger = async (): Promise<any> => {
  try {
    const response = await axios.get(`${BASE_URL}/auth/protected`, { headers: getToken() });
    return response.data;
  } catch (error) {
    console.error("Error al obtener información del usuario:", error);
    throw error;
  }
};

export const handleRequestError = (error: any) => {
  const status = error?.status || error?.response?.status; // aseguramos fallback
  
  if (status === 401 || status === 403) {
    alert("Sesión Expirada!. Inicie sesión nuevamente!");
    logout();
  }
 
  throw new Error(error?.data?.message || error?.response?.data?.message || "Error desconocido");
};

