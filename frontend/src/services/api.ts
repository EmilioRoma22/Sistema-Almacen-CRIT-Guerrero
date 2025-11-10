import type { DatosLogin, Usuario } from "./interfaces";

const API_BASE_URL = import.meta.env.VITE_API_URL

export const iniciarSesion = async (datos: DatosLogin): Promise<{ ok: boolean, token?: string, message?: string }> => {
    try {
        const response = await fetch(`${API_BASE_URL}/usuarios/iniciar_sesion`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(datos),
        });

        const data = await response.json();

        if (response.ok) {
            return {
                ok: true,
                token: data.token,
            }
        }

        return {
            ok: false,
            message: data.detail.error,
        };

    } catch (error) {
        throw new Error("Error al conectar con el servidor");
    }
};

export const obtenerUsuarios = async (): Promise<{ ok: boolean, usuarios?: Usuario[] }> => {
    try {
        const token = localStorage.getItem("token")

        const response = await fetch(`${API_BASE_URL}/usuarios/obtener_usuarios`, {
            headers: {
                "Authorization": `Bearer ${token}`
            }
        });

        const usuarios = await response.json();

        if (response.ok) {
            return {
                ok: true,
                usuarios: usuarios
            }
        }
        
        return {
            ok: false
        }
    } catch (error) {
        throw new Error("Error al conectar con el servidor");
    }
}

export function cerrarSesion(): "ok" {
    localStorage.removeItem("token")
    return "ok"
}
