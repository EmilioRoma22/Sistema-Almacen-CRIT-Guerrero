import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_URL;

const apiAxios = axios.create({
    baseURL: API_BASE_URL,
    withCredentials: true,
});

let isRefreshing = false;
let refreshPromise: Promise<any> | null = null;

apiAxios.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        if (error.response?.status !== 401 || originalRequest._retry) {
            return Promise.reject(error);
        }

        const ruta = originalRequest.url || "";
        const rutasPublicas = ["/usuarios/iniciar_sesion", "/usuarios/refresh", "/usuarios/cerrar_sesion"];
        if (rutasPublicas.some((r) => ruta.includes(r))) {
            return Promise.reject(error);
        }

        originalRequest._retry = true;

        try {
            if (!isRefreshing) {
                isRefreshing = true;
                refreshPromise = axios.post(`${API_BASE_URL}/usuarios/refresh`, {}, { withCredentials: true });
                await refreshPromise;
                isRefreshing = false;
            } else {
                await refreshPromise;
            }

            return apiAxios(originalRequest);
        } catch (refreshError) {
            isRefreshing = false;
            refreshPromise = null;
            return Promise.reject(refreshError);
        }
    }
)

export default apiAxios;
