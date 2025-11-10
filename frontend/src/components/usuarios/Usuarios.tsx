import { Search, UserPlus } from "lucide-react"
import React, { useEffect, useState } from "react"
import type { Usuario } from "../../services/interfaces";
import { useAvisos } from "../../hooks/useAvisos";
import { obtenerUsuarios } from "../../services/api";
import AvisoToastStack from "../AvisoToastStack";
import { Loading } from "../Loading";
import { ErrorCarga } from "../errores/ErrorCarga";

export const Usuarios = () => {
    const [busqueda, setBusqueda] = useState("");
    const [modalAgregar, setModalAgregarVisible] = useState(false);
    const [usuarios, setUsuarios] = useState<Usuario[]>()
    const { avisos, cerrarAviso } = useAvisos()
    const [error, setError] = useState(false)
    const [loading, setLoading] = useState(false)

    const obtUsuarios = async () => {
        try {
            const respuesta = await obtenerUsuarios()
            if (respuesta.ok) setUsuarios(respuesta.usuarios)
            else setError(true)
        } catch (error) {
            setError(true)
        }
    }

    useEffect(() => {
        const cargarDatos = async () => {
            setLoading(true);
            try {
                await Promise.all([
                    obtUsuarios(),
                ]);
            } catch (error) {
                setError(true);
            } finally {
                setLoading(false);
            }
        };

        cargarDatos();
    }, []);

    return (
        <React.Fragment>
            <div className="w-full px-4 md:px-8 py-10 md:py-0.5 overflow-hidden">
                <h1 className="text-2xl font-bold text-[#502779] mb-4">Usuarios</h1>
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-8">
                    <div className="flex flex-col md:flex-row md:items-center grow gap-2 min-w-0">
                        <div className="grow min-w-0">
                            <div className="flex items-center border border-gray-300 rounded-lg px-3 w-full">
                                <Search className="w-5 h-5 text-[#502779] mr-2 shrink-0" />
                                <input
                                    type="text"
                                    value={busqueda}
                                    onChange={(e) => setBusqueda(e.target.value)}
                                    className="w-full py-2 outline-none bg-transparent"
                                    autoFocus
                                />
                            </div>
                        </div>
                        <div className="w-full md:w-auto self-end mt-2 md:mt-0">
                            <button
                                className="flex items-center justify-center gap-2 bg-[#502779] text-white px-4 py-2 rounded-lg hover:bg-[#3d1e5a] transition w-full md:w-auto cursor-pointer"
                                onClick={() => setModalAgregarVisible(true)}
                            >
                                <UserPlus className="w-5 h-6.5" />
                                Agregar usuario
                            </button>
                        </div>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="min-w-[500px] w-full text-sm md:text-base">
                        <thead className="bg-[#e8e1ef] text-[#502779] sticky top-0 z-10">
                            <tr>
                                <th className="px-3 md:px-4 py-2 md:py-3 text-left whitespace-nowrap">Nombre</th>
                                <th className="px-3 md:px-4 py-2 md:py-3 text-left whitespace-nowrap">Correo</th>
                                <th className="px-3 md:px-4 py-2 md:py-3 text-left whitespace-nowrap">Departamento</th>
                                <th className="px-3 md:px-4 py-2 md:py-3 text-left whitespace-nowrap"></th>
                            </tr>
                        </thead>
                    </table>
                </div>
            </div>

            {loading && (
                <Loading />
            )}

            {error && (
                <ErrorCarga mensaje="Hubo un error al cargar los usuarios... Lamentamos las molestias, intente de nuevo." />
            )}

            <AvisoToastStack avisos={avisos} onClose={cerrarAviso} />
        </React.Fragment>
    )
}