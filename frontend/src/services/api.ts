import type { DatosEditarUsuario, DatosLogin, DatosUsuario, Departamento, Usuario } from "./interfaces";

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

export async function crearUsuario(datos: DatosUsuario): Promise<{ ok: boolean, message?: string }> {
    try {
        const token = localStorage.getItem("token");

        const response = await fetch(`${API_BASE_URL}/usuarios/agregar_usuario`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify(datos)
        });

        const data = await response.json();

        if (response.ok) {
            return {
                ok: true,
                message: data.message
            };
        } else {
            return {
                ok: false,
                message: data.detail.error
            };
        }

    } catch (error) {
        throw new Error("Error al conectar con el servidor");
    }
}

export async function actualizar_usuario(datos: DatosEditarUsuario): Promise<{ ok: boolean, message?: string }> {
    try {
        const token = localStorage.getItem("token");


        const response = await fetch(`${API_BASE_URL}/usuarios/actualizar_usuario`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify(datos)
        });

        const data = await response.json();

        if (response.ok) {
            return {
                ok: true,
                message: data.message
            }
        }

        console.error(data.detail.error)

        return {
            ok: false,
            message: data.detail.error || "Error en la respuesta del servidor"
        }
    } catch (error) {
        throw new Error("Error al conectar con el servidor");
    }
}

export async function eliminarUsuario(id_usuario: number): Promise<{ ok: boolean, message: string }> {
    try {
        const token = localStorage.getItem("token");
        const response = await fetch(
            `${API_BASE_URL}/usuarios/eliminar_usuario?id_usuario=${id_usuario}`,
            {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
            }
        );

        const data = await response.json()

        if (response.ok) {
            return {
                ok: true,
                message: data.message
            }
        }

        return {
            ok: false,
            message: data.detail.error
        }
    } catch (error) {
        throw new Error("Error al conectar con el servidor");
    }
}

export const obtenerDepartamentos = async (): Promise<{ ok: boolean, departamentos?: Departamento[] }> => {
    try {
        const token = localStorage.getItem("token")

        const response = await fetch(`${API_BASE_URL}/departamentos/obtener_departamentos`, {
            headers: {
                "Authorization": `Bearer ${token}`
            }
        });

        const departamentos = await response.json();

        if (response.ok) {
            return {
                ok: true,
                departamentos: departamentos
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
