import { createContext, useContext, useState, useEffect } from "react";
import apiAxios from "../services/apiAxios";
import type { TokenPayload } from "../services/interfaces";

interface AuthContextProps {
    usuario: TokenPayload | null;
    loading: boolean;
    setUsuario: React.Dispatch<React.SetStateAction<TokenPayload | null>>;
    cerrarSesionUsuario: () => Promise<void>;
}

const AuthContext = createContext<AuthContextProps>({
    usuario: null,
    loading: true,
    setUsuario: () => { },
    cerrarSesionUsuario: async () => { },
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [usuario, setUsuario] = useState<TokenPayload | null>(null);
    const [loading, setLoading] = useState(true);

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
        <AuthContext.Provider value={{ usuario, loading, setUsuario, cerrarSesionUsuario }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
