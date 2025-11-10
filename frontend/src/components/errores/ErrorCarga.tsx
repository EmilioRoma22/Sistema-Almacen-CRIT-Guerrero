import React from "react";
import { motion } from "framer-motion";
import { TriangleAlert } from "lucide-react";

export const ErrorCarga: React.FC<{mensaje?: string;}> = ({ mensaje = "Hubo un error inesperado, no se pudo cargar la información..." }) => {
    return(
        <motion.div
            className="fixed inset-0 z-50 bg-black/40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
        >
            <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
                <div className="bg-white/0 p-4 rounded-xl flex items-center gap-2">
                    <TriangleAlert className="w-8 h-8 text-red-500"/>
                    <span className="text-white font-semibold">{mensaje}</span>
                </div>
            </div>

        </motion.div>
    );
}