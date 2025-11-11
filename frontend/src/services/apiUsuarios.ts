import apiAxios from "./apiAxios";
import type { DatosEditarUsuario, DatosLogin, DatosUsuario, Usuario } from "./interfaces";

export const iniciarSesion = async (
    datos: DatosLogin
): Promise<{ ok: boolean; usuario?: any; message?: string }> => {
    try {
        const response = await apiAxios.post("/usuarios/iniciar_sesion", datos);

        return {
            ok: true,
            usuario: response.data.usuario,
        };
    } catch (error: any) {
        const message =
            error.response?.data?.detail?.error ||
            error.response?.data?.error ||
            "Error al iniciar sesión.";
        return {
            ok: false,
            message,
        };
    }
};

export const obtenerUsuarios = async (): Promise<{ ok: boolean; usuarios?: Usuario[] }> => {
    try {
        const response = await apiAxios.get("/usuarios/obtener_usuarios");

        return {
            ok: true,
            usuarios: response.data,
        };
    } catch (error: any) {
        console.error("Error al obtener usuarios:", error);
        return {
            ok: false,
        };
    }
};

export async function crearUsuario(datos: DatosUsuario): Promise<{ ok: boolean, message?: string }> {
    try {
        const response = await apiAxios.post("/usuarios/agregar_usuario", datos)

        return {
            ok: true,
            message: response.data.message
        }

    } catch (error: any) {
        const message =
            error.response?.data?.detail?.error ||
            error.response?.data?.error ||
            "Error al crear el usuario.";
        return {
            ok: false,
            message,
        };
    }
}

export async function actualizar_usuario(datos: DatosEditarUsuario): Promise<{ ok: boolean, message?: string }> {

    try {
        const response = await apiAxios.put("/usuarios/actualizar_usuario", datos)

        return {
            ok: true,
            message: response.data.message
        }

    } catch (error: any) {
        const message =
            error.response?.data?.detail?.error ||
            error.response?.data?.error ||
            "Error al actualizar el usuario.";
        return {
            ok: false,
            message,
        };
    }
}

export async function eliminarUsuario(id_usuario: number): Promise<{ ok: boolean, message: string }> {
    try {
        const response = await apiAxios.delete(`/usuarios/eliminar_usuario?id_usuario=${id_usuario}`)

        return {
            ok: true,
            message: response.data.message
        }
    } catch (error: any) {
        const message = error.response.data.detail.error || "Error al eliminar el usuario"
        return {
            ok: false,
            message: message
        }
    }
}

export async function cerrarSesion(): Promise<void> {
    try {
        await apiAxios.post("/usuarios/cerrar_sesion");
    } catch (error) {
        console.error("Error al cerrar sesión:", error);
    }
}

