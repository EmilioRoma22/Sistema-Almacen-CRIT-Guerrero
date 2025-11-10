import { createContext, useContext, useState, useEffect } from "react";
import { jwtDecode } from "jwt-decode";
import { cerrarSesion } from "../services/api";
import type { TokenPayload } from "../services/interfaces";

interface AuthContextProps {
    usuario: TokenPayload | null;
    loading: boolean;
    cerrarSesionUsuario: () => void;
    loginUsuario: (token: string) => void;
}

const AuthContext = createContext<AuthContextProps>({
    usuario: null,
    loading: true,
    cerrarSesionUsuario: () => { },
    loginUsuario: () => { }
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [usuario, setUsuario] = useState<TokenPayload | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        try {
            const token = localStorage.getItem("token");
            if (!token) return;

            const decoded = jwtDecode<TokenPayload>(token);
            const ahora = Date.now() / 1000;

            if (!decoded.exp || decoded.exp < ahora) {
                cerrarSesionUsuario();
                return;
            }

            setUsuario(decoded);
        } catch (err) {
            console.error("Error al decodificar token:", err);
        } finally {
            setLoading(false);
        }
    }, []);

    const loginUsuario = (token: string) => {
        localStorage.setItem("token", token);
        const decoded = jwtDecode<TokenPayload>(token);
        setUsuario(decoded);
    };


    const cerrarSesionUsuario = () => {
        cerrarSesion();
        setUsuario(null);
    };

    return (
        <AuthContext.Provider value={{ usuario, loading, cerrarSesionUsuario, loginUsuario }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
