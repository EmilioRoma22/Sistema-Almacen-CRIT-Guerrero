import { motion } from "framer-motion";
import { AlertTriangle } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import { useNavigate } from "react-router-dom";

export const ErrorTokenExpirado = () => {
    const navigate = useNavigate()
    const { cerrarSesionUsuario } = useAuth()

    return (
        <motion.div
            className="modal-background fixed z-50 inset-0 bg-black/40 flex justify-center items-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
        >
            <motion.div
                className="bg-white p-6 rounded-2xl w-[380px] shadow-2xl border border-gray-200"
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                transition={{ duration: 0.2 }}
            >
                <div className="flex justify-center mb-4">
                    <div className="bg-red-100 p-3 rounded-full">
                        <AlertTriangle className="text-red-600 w-6 h-6" />
                    </div>
                </div>

                <p className="text-center text-gray-800 text-base mb-5">
                    Su sesión ha expirado, vuelva a iniciar sesión.
                    <br />
                </p>

                <div className="flex justify-center gap-4">
                    <button
                        onClick={()=>{
                            cerrarSesionUsuario()
                            navigate("/")
                        }}
                        className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 shadow-sm transition-colors ease-in-out duration-200 cursor-pointer"
                        autoFocus
                    >
                        Confirmar
                    </button>
                </div>
            </motion.div>
        </motion.div>
    );
}