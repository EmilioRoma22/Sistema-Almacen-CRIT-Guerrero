import apiAxios from "./apiAxios";
import type { Categoria } from "./interfaces"

export const obtenerCategorias = async (): Promise<{ ok: boolean, categorias?: Categoria[] }> => {
    try {
        const departamentos = await apiAxios.get("/categorias/obtener_categorias");

        return {
            ok: true,
            categorias: departamentos.data,
        };
    } catch (error: any) {
        console.error("Error al obtener las categorias:", error);
        return {
            ok: false,
        };
    }
} 