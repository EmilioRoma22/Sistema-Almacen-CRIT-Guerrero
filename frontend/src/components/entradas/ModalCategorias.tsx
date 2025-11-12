import { motion } from "framer-motion";
import { Plus } from "lucide-react";
import { useEffect } from "react";
import { Link } from "react-router-dom";
import type { Categoria } from "../../services/interfaces";

type Props = {
    cerrarModal: () => void,
    categorias: Categoria[]
}

export const ModalCategorias = ({ cerrarModal, categorias }: Props) => {
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

    return (
        <motion.div
            className="modal-background fixed z-50 inset-0 bg-black/10 backdrop-blur-xs flex justify-center items-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2, ease: 'easeIn' }}
            onMouseDown={(e) => {
                if ((e.target as HTMLElement).classList.contains("modal-background")) {
                    cerrarModal()
                }
            }}
        >
            <motion.div
                className="bg-white p-6 rounded-2xl w-[300px] shadow-2xl border border-gray-200"
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                transition={{ duration: 0.2 }}
            >
                <div className="flex justify-center mb-4">
                    <div className="bg-purple-200 p-3 rounded-full">
                        <Plus className="text-[#502779] w-6 h-6" />
                    </div>
                </div>
                <label className="block text-xl font-medium text-gray-700 text-center mb-8">¿Que vas a agregar hoy?</label>
                {categorias.map((categoria) => (
                    <Link
                        key={categoria.id_categoria}
                        to={`/entradas/agregar_entrada/${categoria.id_categoria}`}
                        onClick={cerrarModal}
                        className="flex justify-center gap-2 items-center border border-purple-200 text-[#502779] font-bold rounded-2xl p-2 shadow hover:shadow-md transition relative cursor-pointer bg-purple-50 mb-4"
                    >
                        <Plus className="w-6 h-6 text-[#502779]" />
                        <p className='font-semibold text-[#502779] ml-2'>{categoria.nombre_categoria}</p>
                    </Link>
                ))}
            </motion.div>
        </motion.div>
    )
}