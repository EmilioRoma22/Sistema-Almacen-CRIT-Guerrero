import React from "react";
import { motion } from "framer-motion";
import logo_teleton from '../assets/teleton_logo.svg';

export const Loading: React.FC<{mensaje?: string;}> = ({ mensaje = "Cargando..." }) => {
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
                    <img src={logo_teleton} alt="Cargando" className="w-8 h-8 animate-spin" />
                    <span className="text-white font-semibold">{mensaje}</span>
                </div>
            </div>

        </motion.div>
    );
}