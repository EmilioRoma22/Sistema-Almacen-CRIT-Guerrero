import { useEffect } from "react";
import { useNavigate, Outlet } from "react-router-dom";
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
                navigate("/", { replace: true });
                return;
            }

            if (
                permitidoPara.length > 0 &&
                !permitidoPara.map(String).includes(String(usuario.id_departamento))
            ) {
                navigate("/acceso-denegado", { replace: true });
            }

        }
    }, [usuario, loading, navigate, permitidoPara]);

    if (loading) return <Loading />;
    if (!usuario) return null;

    return <Outlet />;
}
