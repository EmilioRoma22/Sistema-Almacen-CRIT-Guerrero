import apiAxios from "./apiAxios";
import type { Productos } from "./interfaces";

export const obtenerProductos = async (): Promise<{ ok: boolean; productos?: Productos[] }> => {
    try {
        const response = await apiAxios.get("/productos/obtener_productos");

        return {
            ok: true,
            productos: response.data,
        };
    } catch (error: any) {
        console.error("Error al obtener los productos:", error);
        return {
            ok: false,
        };
    }
};