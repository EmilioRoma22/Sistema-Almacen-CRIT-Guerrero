import { useEffect } from "react";
import { useNavigate, Outlet } from "react-router-dom";
import Error from "./errores/Error";
import { Loading } from "./Loading";
import { useAuth } from "../contexts/AuthContext";

interface RutaProtegidaProps {
    permitidoPara?: (string | number)[];
}

export default function RutaProtegida({ permitidoPara = [] }: RutaProtegidaProps) {
    const navigate = useNavigate();
    const { usuario, loading } = useAuth();

    useEffect(() => {
        if (!loading) {
            if (!usuario) {
                navigate("/");
            } else if (permitidoPara.length > 0 && !permitidoPara.includes(usuario.id_departamento)) {
                navigate("/acceso-denegado");
            }
        }
    }, [usuario, loading, navigate, permitidoPara]);

    if (loading) return <Loading />;
    if (!usuario) return <Error />;

    return <Outlet />;
}
