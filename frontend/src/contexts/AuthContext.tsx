import { createContext, useContext, useState, useEffect } from "react";
import apiAxios from "../services/apiAxios";
import type { TokenPayload } from "../services/interfaces";
import { registerAuthHandlers } from "../services/apiAxios";

interface AuthContextProps {
    usuario: TokenPayload | null;
    loading: boolean;
    setUsuario: React.Dispatch<React.SetStateAction<TokenPayload | null>>;
    cerrarSesionUsuario: () => Promise<void>;
    sesionExpirada: boolean;
    setSesionExpirada: (value: boolean) => void;
}

const AuthContext = createContext<AuthContextProps>({
    usuario: null,
    loading: true,
    setUsuario: () => { },
    cerrarSesionUsuario: async () => { },
    sesionExpirada: false,
    setSesionExpirada: () => { },
})

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [usuario, setUsuario] = useState<TokenPayload | null>(null);
    const [loading, setLoading] = useState(true);
    const [sesionExpirada, setSesionExpirada] = useState(false);

    useEffect(() => {
        const verificarSesion = async () => {
            try {
                const response = await apiAxios.get("/usuarios/me");
                setUsuario(response.data.usuario);
            } catch (error) {
                setUsuario(null);
            } finally {
                setLoading(false);
            }
        };

        verificarSesion();
    }, []);

    useEffect(() => {
        registerAuthHandlers(setUsuario, setSesionExpirada);
    }, [setUsuario, setSesionExpirada]);

    const cerrarSesionUsuario = async () => {
        try {
            await apiAxios.post("/usuarios/cerrar_sesion");
        } catch (err) {
            console.error("Error al cerrar sesión:", err);
        } finally {
            setUsuario(null);
        }
    };

    return (
        <AuthContext.Provider value={{
            usuario,
            loading,
            setUsuario,
            cerrarSesionUsuario,
            sesionExpirada,
            setSesionExpirada
        }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
