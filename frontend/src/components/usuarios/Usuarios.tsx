import { Search, Trash2, UserPlus, UserRoundPen } from "lucide-react"
import React, { useEffect, useState } from "react"
import type { Departamento, Usuario } from "../../services/interfaces";
import { useAvisos } from "../../hooks/useAvisos";
import { obtenerUsuarios } from "../../services/apiUsuarios";
import { obtenerDepartamentos } from "../../services/apiDepartamentos";
import AvisoToastStack from "../AvisoToastStack";
import { Loading } from "../Loading";
import { ErrorCarga } from "../errores/ErrorCarga";
import { useAuth } from "../../contexts/AuthContext";
import { useIsMobile } from "../../hooks/useEsMobile";
import ModalAgregarUsuario from "./ModalAgregarUsuario";
import { AnimatePresence } from "motion/react";
import ModalModificarUsuario from "./ModalModificarUsuario";
import ModalEliminarUsuario from "./ModalEliminarUsuario";

export const Usuarios = () => {
    const [busqueda, setBusqueda] = useState("");
    const [modalAgregar, setModalAgregarVisible] = useState(false);
    const [modalEditar, setModalEditarVisible] = useState(false);
    const [modalEliminar, setModalEliminarVisible] = useState(false);
    const [usuarioSeleccionado, setUsuarioSeleccionado] = useState<Usuario | null>(null);
    const [usuarios, setUsuarios] = useState<Usuario[]>()
    const [departamentos, setDepartamentos] = useState<Departamento[]>()
    const { avisos, cerrarAviso, mostrarAviso } = useAvisos()
    const [error, setError] = useState(false)
    const [loading, setLoading] = useState(false)
    const { usuario } = useAuth()
    const esMobile = useIsMobile()

    const [formUsuario, setFormUsuario] = useState({
        nombre_usuario: "",
        apellidos_usuario: "",
        correo_usuario: "",
        id_departamento: 0,
        contraseña_usuario: "",
        confirmar_contraseña: "",
    });
    const [formEditarUsuario, setFormEditarUsuario] = useState({
        nombre_usuario: "",
        apellidos_usuario: "",
        correo_usuario: "",
        id_usuario: 0,
        id_departamento: 0
    })
    const [infoUsuario, setInfoUsuario] = useState({
        esResponsable: false,
        nombre_usuario: "",
        apellidos_usuario: ""
    });

    const obtUsuarios = async () => {
        try {
            const respuesta = await obtenerUsuarios()
            if (respuesta.ok) setUsuarios(respuesta.usuarios)
            else setError(true)
        } catch (error) {
            setError(true)
        }
    }

    const obtDepartamentos = async () => {
        try {
            const respuesta = await obtenerDepartamentos()
            if (respuesta.ok) setDepartamentos(respuesta.departamentos)
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
                    obtDepartamentos(),
                ]);
            } catch (error) {
                setError(true);
            } finally {
                setLoading(false);
            }
        };

        cargarDatos();
    }, []);

    const usuariosFiltrados = (usuarios ?? []).filter((usuario) => {
        const termino = busqueda
            .toLowerCase()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "");

        const normalizar = (texto: string = "") =>
            texto.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

        return (
            normalizar(usuario.nombre_usuario + " " + usuario.apellidos_usuario).includes(termino) ||
            normalizar(usuario.correo_usuario).includes(termino) ||
            normalizar(usuario.nombre_departamento).includes(termino)
        );
    });

    const ids_responsables = new Set(departamentos ? departamentos.map(dep => dep.id_responsable) : []);

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
                                    autoFocus={!esMobile}
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

                <div className="overflow-x-auto max-h-[680px] scrollbar-vertical">
                    <table className="min-w-[500px] w-full text-sm md:text-base">
                        <thead className="bg-[#e8e1ef] text-[#502779] sticky top-0 z-10">
                            <tr>
                                <th className="px-3 md:px-4 py-2 md:py-3 text-left whitespace-nowrap">Nombre</th>
                                <th className="px-3 md:px-4 py-2 md:py-3 text-left whitespace-nowrap">Correo</th>
                                <th className="px-3 md:px-4 py-2 md:py-3 text-left whitespace-nowrap">Departamento</th>
                                <th className="px-3 md:px-4 py-2 md:py-3 text-left whitespace-nowrap"></th>
                                <th className="px-3 md:px-4 py-2 md:py-3 text-left whitespace-nowrap"></th>
                            </tr>
                        </thead>
                        <tbody>
                            {usuariosFiltrados.map((_usuario) => {
                                const esResponsable = ids_responsables.has(_usuario.id_usuario);

                                return (
                                    <tr
                                        key={_usuario.id_usuario}
                                        className={`transition-colors duration-200 ease-in-out ${usuario?.id_usuario === _usuario.id_usuario ? "hover:bg-red-50" : "hover:bg-gray-200"}`}
                                    >
                                        <td className="px-4 py-3 max-w-[180px] truncate whitespace-nowrap overflow-hidden">
                                            {_usuario.nombre_usuario} {_usuario.apellidos_usuario} {esResponsable ? " (responsable)" : ""}
                                        </td>

                                        <td className="px-4 py-3">{_usuario.correo_usuario}</td>
                                        <td className="px-4 py-3 max-w-[180px] truncate whitespace-nowrap overflow-hidden">{_usuario.nombre_departamento}</td>
                                        <td>
                                            <button
                                                className={`flex justify-center h-full w-full p-4 transition-colors ease-in-out duration-200 text-center ${(_usuario.id_usuario === usuario?.id_usuario)
                                                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                                    : 'bg-purple-200 text-[#502779] hover:bg-purple-300 cursor-pointer'
                                                    }`}
                                                disabled={_usuario.id_usuario === usuario?.id_usuario}
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    if (usuario?.id_usuario !== _usuario.id_usuario) {
                                                        setInfoUsuario({
                                                            "esResponsable": esResponsable,
                                                            "nombre_usuario": _usuario.nombre_usuario,
                                                            "apellidos_usuario": _usuario.apellidos_usuario
                                                        });
                                                        setFormEditarUsuario({
                                                            "nombre_usuario": _usuario.nombre_usuario,
                                                            "apellidos_usuario": _usuario.apellidos_usuario,
                                                            "correo_usuario": _usuario.correo_usuario,
                                                            "id_departamento": _usuario.id_departamento,
                                                            "id_usuario": _usuario.id_usuario,
                                                        })
                                                        setModalEditarVisible(true)
                                                    }
                                                }}
                                            >
                                                <UserRoundPen className="w-6 h-6" />
                                            </button>
                                        </td>
                                        <td>
                                            <button
                                                className={`flex justify-center h-full w-full p-4 transition-colors ease-in-out duration-200 text-center ${(esResponsable || _usuario.id_usuario === usuario?.id_usuario)
                                                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                                    : 'bg-red-100 text-red-600 hover:bg-red-200 cursor-pointer'
                                                    }`}
                                                title={
                                                    _usuario.id_usuario === usuario?.id_usuario
                                                        ? esResponsable
                                                            ? "No puedes eliminar tu propio usuario y también eres responsable de un departamento"
                                                            : "No puedes eliminar tu propio usuario"
                                                        : esResponsable
                                                            ? "No se puede eliminar porque el usuario es responsable de un departamento"
                                                            : "Eliminar"
                                                }
                                                disabled={esResponsable || _usuario.id_usuario === usuario?.id_usuario}
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setUsuarioSeleccionado(_usuario);
                                                    setModalEliminarVisible(true);
                                                }}
                                            >
                                                <Trash2 className="w-6 h-6" />
                                            </button>
                                        </td>
                                    </tr>
                                )
                            })}
                        </tbody>
                    </table>
                </div>
            </div>

            <AnimatePresence>
                {modalAgregar && (
                    <ModalAgregarUsuario
                        formUsuario={formUsuario}
                        setFormUsuario={setFormUsuario}
                        mostrarAviso={mostrarAviso}
                        cerrarModal={() => setModalAgregarVisible(false)}
                        departamentos={departamentos ? departamentos : []}
                    />
                )}
            </AnimatePresence>

            <AnimatePresence>
                {modalEditar && (
                    <ModalModificarUsuario
                        formUsuario={formEditarUsuario}
                        setFormUsuario={setFormEditarUsuario}
                        cerrarModal={() => { setModalEditarVisible(false) }}
                        departamentos={departamentos ? departamentos : []}
                        infoUsuario={infoUsuario}
                        mostrarAviso={mostrarAviso}
                    />
                )}
            </AnimatePresence>

            <AnimatePresence>
                {modalEliminar && (
                    <ModalEliminarUsuario
                        cerrarModal={() => setModalEliminarVisible(false)}
                        usuario={usuarioSeleccionado}
                        mostrarAviso={mostrarAviso}
                    />
                )}
            </AnimatePresence>

            <AnimatePresence>
                {loading && (
                    <Loading />
                )}
            </AnimatePresence>

            {error && (
                <ErrorCarga mensaje="Hubo un error al cargar los usuarios... Lamentamos las molestias, intente de nuevo." />
            )}

            <AvisoToastStack avisos={avisos} onClose={cerrarAviso} />
        </React.Fragment>
    )
}