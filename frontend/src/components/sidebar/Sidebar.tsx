import { motion } from "motion/react"
import React, { useEffect, useState } from "react"
import { decodeJWT } from "../../services/jwt_decode";
import { useNavigate } from "react-router-dom";
import { Menu } from "lucide-react";

export const Sidebar = () => {
    const navigate = useNavigate()
    const [open, setOpen] = useState(true);
    const [nombreDepartamento, setNombreDepartamento] = useState("")

    useEffect(()=> {
        const token = localStorage.getItem("token")
        
        if (!token) {
            navigate("/")
            return
        }

        const decoded = decodeJWT(token)

        if (!decoded) {
            navigate("/")
            return
        }

        setNombreDepartamento(decoded.nombre_departamento)

    }, [])
    
    return (
        <React.Fragment>
            <div className="h-screen flex bg-gray-50 text-gray-800">
                <motion.aside
                    animate={{ width: open ? 250 : 80 }}
                    className="bg-white border-r border-gray-200 flex flex-col justify-between shadow-md transition-all duration-300"
                >
                    <div>
                        <div className="flex items-center justify-between px-4 py-5 border-b border-gray-200">
                            <motion.h1
                                animate={{ opacity: open ? 1 : 0 }}
                                className={`text-lg font-bold text-gray-900 tracking-wide ${!open && "hidden"}`}
                            >
                                {nombreDepartamento ? nombreDepartamento : "SISTEMA DE ALMACEN"}
                            </motion.h1>
                            <button
                                onClick={() => setOpen(!open)}
                                className={`text-gray-900 hover:text-gray-800 transition ${!open && "rotate-180"}`}
                            >
                                <Menu size={22} />
                            </button>
                        </div>

                        <nav className="flex flex-col mt-3">
                            {items
                                .filter(item => itemsPermitidos.includes(item.label))
                                .map((item, i) => (
                                    <motion.div
                                        key={i}
                                        whileHover={{ scale: 1.03 }}
                                        whileTap={{ scale: 0.97 }}
                                        onClick={() => onSelect(item.label)}
                                        className={`flex items-center gap-3 px-5 py-3 mx-2 my-1 rounded-xl cursor-pointer transition-all duration-300 ${active === item.label
                                            ? "bg-gray-800 text-white font-medium border-l-4 border-gray-400"
                                            : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                                            }`}
                                    >
                                        <div>{item.icon}</div>
                                        <AnimatePresence>
                                            {open && (
                                                <motion.span
                                                    initial={{ opacity: 0, x: -10 }}
                                                    animate={{ opacity: 1, x: 0 }}
                                                    exit={{ opacity: 0, x: -10 }}
                                                    transition={{ duration: 0.2 }}
                                                    className="text-sm"
                                                >
                                                    {item.label}
                                                </motion.span>
                                            )}
                                        </AnimatePresence>
                                    </motion.div>
                                ))}
                        </nav>

                    </div>

                    <div className="border-t border-gray-200 mt-2">
                        <motion.div
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={onLogout}
                            className="flex items-center gap-3 px-5 py-4 mx-2 my-2 text-red-600 hover:bg-red-100 rounded-xl cursor-pointer transition"
                        >
                            <LogOut size={20} />
                            {open && <span className="text-sm font-medium">Cerrar sesión</span>}
                        </motion.div>
                    </div>
                </motion.aside>
            </div>
        </React.Fragment>
    )
}