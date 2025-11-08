import type { DatosLogin } from "./interfaces";

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

        console.error(data.detail.error)

        return {
            ok: false,
            message: "Hubo un error en el servidor, intenta más tarde.",
        };

    } catch (error) {
        throw new Error("Error al conectar con el servidor");
    }
};

export function cerrarSesion(): "ok" {
    localStorage.removeItem("token")
    return "ok"
}
