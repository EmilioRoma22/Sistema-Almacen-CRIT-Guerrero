import { useEffect, useState } from "react";
import Header from "../header/Header";
import Loading from "../Loading";
import Error from "../errores/Error";
import AvisoToastStack from "../avisos/AvisoToastStack";
import { type Usuario } from "../../services/api";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Trash2, UserPlus } from "lucide-react";
import { useDepartamentosContext } from "../../context/DepartamentosContext";
import { useUsuariosContext } from "../../context/UsuariosContext";
import { ModalAgregarUsuario, ModalEliminarUsuario, ModalModificarUsuario } from "./index";
import { useAvisos } from "../../hooks/avisos";
import { nuevaNotificacion } from "../../utils/notificacion";
import { useNavigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";

const Usuarios = () => {
    const navigate = useNavigate()
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
        id_departamento: 0,
    })
    const [infoUsuario, setInfoUsuario] = useState({
        id_usuario: 0,
        esResponsable: false,
        nombre_usuario: "",
        apellidos_usuario: ""
    });
    const [busqueda, setBusqueda] = useState("");
    const [modalAgregar, setModalAgregarVisible] = useState(false);
    const [modalEditar, setModalEditarVisible] = useState(false);
    const [modalEliminar, setModalEliminarVisible] = useState(false);
    const [usuarioSeleccionado, setUsuarioSeleccionado] = useState<Usuario | null>(null);
    const { avisos, mostrarAviso, cerrarAviso } = useAvisos();
    const [cargandoInformacion, setCargandoInformacion] = useState(true)

    const { departamentos, loading_departamentos, error_departamentos } = useDepartamentosContext();
    const { usuarios, loading_usuarios, error_usuarios } = useUsuariosContext();
    const opcionesUsuarios = usuarios.filter(usuario => usuario.id_departamento > 1)
    const idString = localStorage.getItem("id_usuario");
    const usuarioActualId = idString ? parseInt(idString, 10) : null;
    const ids_responsables = new Set(departamentos.map(dep => dep.id_responsable));

    const usuariosFiltrados = opcionesUsuarios.filter((usuario) => {
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

    if (error_usuarios || error_departamentos) {
        return <Error />;
    }

    useEffect(() => {
        const handler = (e: Event) => {
            const customEvent = e as CustomEvent
            const { mensaje, titulo, url } = customEvent.detail

            nuevaNotificacion(mensaje, titulo, url, navigate)
        }

        window.addEventListener("mostrarAviso", handler)

        return () => {
            window.removeEventListener("mostrarAviso", handler)
        }
    }, [])

    useEffect(() => {
        if (!loading_departamentos && !loading_usuarios) {
            setCargandoInformacion(false)
        }
    }, [loading_departamentos, loading_usuarios])

    return (
        <>
            <Header />
            <div className="pt-20 px-4 mt-2 md:px-8 max-w-[1700px] mx-auto">
                <h1 className="text-2xl font-bold text-[#502779] mb-4">Usuarios</h1>
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-8">
                    <div className="flex flex-col md:flex-row md:items-center flex-grow gap-2 min-w-0">
                        <div className="flex-grow min-w-0">
                            <label className='text-gray-500 mb-2 block'>Buscar por nombre, apellidos, correo o departamento</label>
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

                <div className="overflow-x-auto max-h-[730px]">
                    <table className="min-w-[600px] w-full text-sm">
                        <thead className="bg-[#e8e1ef] text-[#502779] sticky top-0 z-10">
                            <tr>
                                <th className="px-4 py-3 text-left">Nombre</th>
                                <th className="px-4 py-3 text-left">Correo</th>
                                <th className="px-4 py-3 text-left">Departamento</th>
                                <th className="px-4 py-3 text-center"></th>
                            </tr>
                        </thead>
                        <tbody>
                            <AnimatePresence>
                                {usuariosFiltrados.map((usuario, index) => {
                                    const esResponsable = ids_responsables.has(usuario.id_usuario);
                                    return (
                                        <motion.tr
                                            key={usuario.id_usuario}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -10 }}
                                            transition={{ duration: 0.3, delay: index * 0.02 }}
                                            className={`transition-colors duration-200 ease-in-out cursor-pointer ${usuarioActualId === usuario.id_usuario ? "hover:bg-red-50" : "hover:bg-gray-200"}`}
                                            onClick={() => {
                                                setInfoUsuario({
                                                    "id_usuario": usuario.id_usuario,
                                                    "esResponsable": esResponsable,
                                                    "nombre_usuario": usuario.nombre_usuario,
                                                    "apellidos_usuario": usuario.apellidos_usuario
                                                });
                                                setFormEditarUsuario({
                                                    "nombre_usuario": usuario.nombre_usuario,
                                                    "apellidos_usuario": usuario.apellidos_usuario,
                                                    "correo_usuario": usuario.correo_usuario,
                                                    "id_departamento": usuario.id_departamento,

                                                })
                                                setModalEditarVisible(true)
                                            }}
                                        >
                                            <td className="px-4 py-3">
                                                {usuario.nombre_usuario} {usuario.apellidos_usuario} {esResponsable ? " (responsable)" : ""}
                                            </td>
                                            <td className="px-4 py-3">{usuario.correo_usuario}</td>
                                            <td className="px-4 py-3">{usuario.nombre_departamento}</td>
                                            <td className="px-1 py-3 text-center space-x-2">
                                                <button
                                                    className={`p-2 rounded-full transition-colors ease-in-out duration-200 ${(esResponsable || usuario.id_usuario === usuarioActualId)
                                                        ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                                        : 'bg-red-100 text-red-600 hover:bg-red-200 cursor-pointer'
                                                        }`}
                                                    title={
                                                        usuario.id_usuario === usuarioActualId
                                                            ? esResponsable
                                                                ? "No puedes eliminar tu propio usuario y también eres responsable de un departamento"
                                                                : "No puedes eliminar tu propio usuario"
                                                            : esResponsable
                                                                ? "No se puede eliminar porque el usuario es responsable de un departamento"
                                                                : "Eliminar"
                                                    }
                                                    disabled={esResponsable || usuario.id_usuario === usuarioActualId}
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setUsuarioSeleccionado(usuario);
                                                        setModalEliminarVisible(true);
                                                    }}
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </td>
                                        </motion.tr>
                                    );
                                })}
                            </AnimatePresence>
                            {usuariosFiltrados.length === 0 && (
                                <tr>
                                    <td className="text-center py-6 text-gray-500">
                                        No se encontraron usuarios.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <AnimatePresence>
                {modalAgregar && (
                    <motion.div
                        className="modal-background fixed z-50 inset-0 bg-black/0 flex justify-center items-center"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                    >
                        <ModalAgregarUsuario
                            cerrarModal={() => setModalAgregarVisible(false)}
                            mostrarAviso={mostrarAviso}
                            formUsuario={formUsuario}
                            setFormUsuario={setFormUsuario}
                        />
                    </motion.div>
                )}
            </AnimatePresence>

            <AnimatePresence>
                {modalEliminar && (
                    <motion.div
                        className="modal-background fixed z-50 inset-0 bg-black/0 flex justify-center items-center"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                    >
                        <ModalEliminarUsuario
                            cerrarModal={() => setModalEliminarVisible(false)}
                            mostrarAviso={mostrarAviso}
                            usuario={usuarioSeleccionado}
                        />

                    </motion.div>
                )}
            </AnimatePresence>

            <AnimatePresence>
                {modalEditar && (
                    <ModalModificarUsuario
                        cerrarModal={() => setModalEditarVisible(false)}
                        formUsuario={formEditarUsuario}
                        infoUsuario={infoUsuario}
                        mostrarAviso={mostrarAviso}
                        setFormUsuario={setFormEditarUsuario}
                    />
                )}
            </AnimatePresence>

            <Toaster />
            {cargandoInformacion && <Loading tipo={2} mensaje="Cargando..." />}
            <AvisoToastStack avisos={avisos} onClose={cerrarAviso} />
        </>
    );
};

export default Usuarios;