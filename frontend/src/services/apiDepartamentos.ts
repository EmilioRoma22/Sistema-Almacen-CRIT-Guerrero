import apiAxios from "./apiAxios";
import type { DatosEditarDepartamento, Departamento } from "./interfaces";

export const obtenerDepartamentos = async (): Promise<{ ok: boolean, departamentos?: Departamento[] }> => {
    try {
        const departamentos = await apiAxios.get("/departamentos/obtener_departamentos");

        return {
            ok: true,
            departamentos: departamentos.data,
        };
    } catch (error: any) {
        console.error("Error al obtener departamentos:", error);
        return {
            ok: false,
        };
    }
}

export async function crearDepartamento(departamento: { nombre_departamento: string }): Promise<{ ok: boolean, message: string }> {
    try {
        const response = await apiAxios.post("/departamentos/agregar_departamento", departamento)

        return {
            ok: true,
            message: response.data.message
        }

    } catch (error: any) {
        const message =
            error.response?.data?.detail?.error ||
            error.response?.data?.error ||
            "Error al crear el departamento.";
        return {
            ok: false,
            message,
        };
    }
}

export async function editarDepartamento(datos: DatosEditarDepartamento): Promise<{ ok: boolean, message: string }> {
    try {
        const response = await apiAxios.put("/departamentos/modificar_departamento", datos)

        return {
            ok: true,
            message: response.data.message
        }

    } catch (error: any) {
        const message =
            error.response?.data?.detail?.error ||
            error.response?.data?.error ||
            "Error al modificar el departamento.";
        return {
            ok: false,
            message,
        };
    }
}

export const eliminarDepartamento = async (infoDepartamento: { id_departamento: number }): Promise<{ ok: boolean, message: string }> => {
    try {
        const response = await apiAxios.delete("/departamentos/eliminar_departamento", {
            data: infoDepartamento
        });

        return {
            ok: true,
            message: response.data.message
        }

    } catch (error: any) {
        const message =
            error.response?.data?.detail?.error ||
            error.response?.data?.error ||
            "Error al eliminar el departamento.";
        return {
            ok: false,
            message,
        };
    }
}
