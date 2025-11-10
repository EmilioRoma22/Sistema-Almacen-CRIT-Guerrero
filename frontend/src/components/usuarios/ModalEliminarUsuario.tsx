import { motion } from "framer-motion";
import { Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { Loading } from "../Loading";
import Error from "../errores/Error";
import { eliminarUsuario } from "../../services/api";
import type { Usuario } from "../../services/interfaces";

type Props = {
    cerrarModal: () => void
    mostrarAviso: (mensaje: string, tipo: "error" | "success" | "aviso") => void
    usuario: Usuario | null
};

const ModalEliminarUsuario = ({ cerrarModal, mostrarAviso, usuario }: Props) => {
    const [loading, setLoading] = useState(false);
    const [errorServidor, setErrorServidor] = useState(false);

    async function confirmarEliminarUsuario(_event: React.MouseEvent<HTMLButtonElement>): Promise<void> {
        if (!usuario) {
            cerrarModal();
            return
        };
        setLoading(true);

        try {
            const respuesta = await eliminarUsuario(usuario.id_usuario);

            if (respuesta.ok) {
                mostrarAviso(respuesta.message || "Se ha eliminado el usuario correctamente", "success");
                cerrarModal();
            } else {
                mostrarAviso(respuesta.message || "No se ha podido actualizar el usuario", "error");
                cerrarModal();
            }
        } catch (error) {
            mostrarAviso("Error del servidor", "error");
            setErrorServidor(true);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                cerrarModal();
            }
        };

        window.addEventListener('keydown', handleKeyDown);

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, []);

    if (errorServidor) return (
        <>
            <div className="fixed z-50 inset-0 bg-white flex justify-center items-center">
                <Error />
            </div>
        </>
    )

    return (
        <motion.div
            className="modal-background fixed z-50 inset-0 bg-black/40 flex justify-center items-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onMouseDown={(e) => {
                if ((e.target as HTMLElement).classList.contains("modal-background")) {
                    cerrarModal();
                }
            }}
        >
            <motion.div
                className="bg-white p-6 rounded-2xl w-[380px] shadow-2xl border border-gray-200"
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                transition={{ duration: 0.3 }}
            >
                <div className="flex justify-center mb-4">
                    <div className="bg-red-100 p-3 rounded-full">
                        <Trash2 className="text-red-600 w-6 h-6" />
                    </div>
                </div>

                <p className="text-center text-gray-800 text-base mb-5">
                    ¿Deseas eliminar al usuario <strong>{usuario?.nombre_usuario} {usuario?.apellidos_usuario}</strong>?
                    <br />
                    <span className="text-sm text-gray-500">Esta acción no se puede deshacer.</span>
                </p>

                <div className="flex justify-center gap-4">
                    <button
                        onClick={confirmarEliminarUsuario}
                        className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 shadow-sm transition-colors ease-in-out duration-200 cursor-pointer"
                        autoFocus
                    >
                        Confirmar
                    </button>
                    <button
                        type="button"
                        onClick={() => cerrarModal()}
                        className="bg-gray-200 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-300 shadow-sm transition-colors ease-in-out duration-200 cursor-pointer"
                    >
                        Cancelar
                    </button>
                </div>

                {loading && (<Loading mensaje="Eliminando usuario..." />)}
            </motion.div>
        </motion.div>
    );
}

export default ModalEliminarUsuario;