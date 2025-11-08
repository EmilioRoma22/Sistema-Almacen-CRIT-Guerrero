import { AnimatePresence, motion } from "framer-motion";
import { X, XCircle, CheckCircle, AlertCircle } from "lucide-react";

type TipoAviso = "error" | "success" | "aviso";

type Aviso = {
    id: number;
    mensaje: string;
    tipo: TipoAviso;
};

type AvisoToastStackProps = {
    avisos: Aviso[];
    onClose: (id: number) => void;
};

const colores = {
    error: {
        bg: "bg-red-100",
        text: "text-red-800",
        border: "border-red-300",
        icon: <XCircle className="text-red-600 w-5 h-5" />,
    },
    success: {
        bg: "bg-green-100",
        text: "text-green-800",
        border: "border-green-300",
        icon: <CheckCircle className="text-green-600 w-5 h-5" />,
    },
    aviso: {
        bg: "bg-orange-100",
        text: "text-orange-800",
        border: "border-orange-300",
        icon: <AlertCircle className="text-orange-600 w-5 h-5" />,
    },
};

export default function AvisoToastStack({ avisos, onClose }: AvisoToastStackProps) {
    return (
        <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 space-y-3 z-50">
            <AnimatePresence>
                {avisos.map((aviso) => {
                    const color = colores[aviso.tipo];

                    return (
                        <motion.div
                            key={aviso.id}
                            initial={{ y: 50, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            exit={{ y: 50, opacity: 0 }}
                            transition={{
                                type: 'spring',
                                stiffness: 300,
                                damping: 25
                            }}
                            className={`px-4 py-3 rounded-lg shadow-lg border ${color.bg} ${color.border}`}
                        >
                            <div className="flex items-center gap-3">
                                {color.icon}
                                <p className={`text-sm font-medium ${color.text}`}>{aviso.mensaje}</p>
                                <button
                                    onClick={() => onClose(aviso.id)}
                                    className="ml-auto text-gray-500 hover:text-black"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>
                        </motion.div>
                    );
                })}
            </AnimatePresence>
        </div >
    );
}