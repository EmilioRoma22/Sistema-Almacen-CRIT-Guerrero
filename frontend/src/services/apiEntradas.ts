import apiAxios from "./apiAxios";
import type { Entrada, Entradas, Resguardo } from "./interfaces";

export async function obtenerEntradas(): Promise<{ ok: boolean, entradas?: Entradas[] }> {
    try {
        const response = await apiAxios.get("/entradas/obtener_entradas")

        return {
            ok: true,
            entradas: response.data
        }
    } catch (error) {
        console.error("Error al obtener las entradas:", error);
        return {
            ok: false,
        };
    }
}

export async function agregarEntrada(datos: Entrada): Promise<{ ok: boolean, message?: string, nombre_pdf?: string }> {
    try {
        const response = await apiAxios.post("/entradas/agregar_entrada", datos)

        return {
            ok: true,
            message: response.data.message,
            nombre_pdf: response.data.nombre_pdf
        }
    } catch (error: any) {
        console.error("Error al agregar la entrada:", error);
        const message =
            error.response?.data?.detail?.error ||
            error.response?.data?.error ||
            "Error al agregar la entrada.";
        return {
            ok: false,
            message: message
        };
    }
}

export async function agregarResguardo(datos: Resguardo): Promise<{ ok: boolean, message?: string, nombre_pdf?: string }> {
    try {
        const response = await apiAxios.post("/resguardos/agregar_resguardo", datos)

        return {
            ok: true,
            message: response.data.message,
            nombre_pdf: response.data.nombre_pdf
        }
    } catch (error: any) {
        console.error("Error al agregar la entrada:", error);
        const message =
            error.response?.data?.detail?.error ||
            error.response?.data?.error ||
            "Error al agregar la entrada.";
        return {
            ok: false,
            message: message
        };
    }
}