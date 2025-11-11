import logo_teleton from "../../assets/teleton_logo.svg"
import { AnimatePresence, motion } from "motion/react"
import React, { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom";
import { Bell, Box, BoxesIcon, Building, ChartColumn, FileText, HandHelping, History, LogOut, Menu, RefreshCcwDotIcon, ShoppingBag, User, UsersRound } from "lucide-react";
import { elementosPermitidos } from "../../utils/elementosPermitidos";
import { useAuth } from "../../contexts/AuthContext";
import { useIsMobile } from "../../hooks/useEsMobile";

export const Sidebar = () => {
    const navigate = useNavigate()
    const esMobile = useIsMobile()
    const { usuario } = useAuth()
    const [open, setOpen] = useState(false);
    const { cerrarSesionUsuario } = useAuth()

    const items = [
        { icon: <UsersRound size={20} />, label: "Usuarios", ruta: '/usuarios' },
        { icon: <Building size={20} />, label: "Departamentos", ruta: '/departamentos' },
        { icon: <BoxesIcon size={20} />, label: "Entradas", ruta: '/entradas' },
        { icon: <Box size={20} />, label: "Resguardos", ruta: '/resguardos' },
        { icon: <HandHelping size={20} />, label: "Entregas", ruta: '/entregas' },
        { icon: <ShoppingBag size={20} />, label: "Requisiciones", ruta: '/requisiciones' },
        { icon: <RefreshCcwDotIcon size={20} />, label: "Movimientos", ruta: '/movimientos' },
        { icon: <FileText size={20} />, label: "Reportes", ruta: '/reportes' },
        { icon: <ChartColumn size={20} />, label: "Estadísticas", ruta: '/estadisticas' },
        { icon: <History size={20} />, label: "Historial de Acciones", ruta: '/acciones' },
    ]

    const elementos = elementosPermitidos[Number(usuario?.id_departamento) as 1 | 2 | 3 | 4] || []

    useEffect(() => {
        if (esMobile) setOpen(false)
        else setOpen(true)
    }, [esMobile])

    return (
        <React.Fragment>
            <div className="min-h-screen flex bg-white text-white overflow-hidden">
                {esMobile && (
                    <button
                        onClick={() => setOpen(true)}
                        className="fixed top-4 left-4 z-50 p-2 cursor-pointer"
                    >
                        <Menu size={22} className="text-gray-800" />
                    </button>
                )}

                <AnimatePresence>
                    {esMobile && open && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 0.4 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            onClick={() => setOpen(false)}
                            className="fixed inset-0 bg-black z-40"
                        />
                    )}
                </AnimatePresence>

                <motion.aside
                    animate={{
                        x: esMobile ? (open ? 0 : "-100%") : 0,
                        width: esMobile ? 220 : open ? 230 : 80,
                    }}
                    transition={{ type: "tween", duration: 0.3 }}
                    className={`bg-[#502779] border-r border-gray-200 fixed md:static top-0 left-0 h-full z-50 shadow-md overflow-y-auto md:overflow-visible`}
                >
                    <div className="flex flex-col justify-between h-full overflow-hidden">
                        <div>
                            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
                                <motion.img
                                    animate={{ opacity: open ? 1 : 0 }}
                                    className={`w-10 h-10 bg-white/10 p-1 rounded-full ${!open && "hidden"}`}
                                    src={logo_teleton}
                                />
                                <div className="flex gap-x-4">
                                    <button
                                        onClick={() => setOpen(!open)}
                                        className={`text-white hover:text-gray-200 transition cursor-pointer ${!open && "rotate-180"}`}
                                    >
                                        <Bell size={22} />
                                    </button>
                                    <button
                                        onClick={() => setOpen(!open)}
                                        className={`text-white hover:text-gray-200 transition cursor-pointer ${!open && "rotate-180"}`}
                                    >
                                        <Menu size={22} />
                                    </button>
                                    
                                </div>
                            </div>

                            <nav className="flex flex-col mt-3">
                                {items
                                    .filter(item => elementos.includes(item.label))
                                    .map((item, i) => (
                                        <motion.div
                                            key={i}
                                            whileHover={{ scale: 1.03 }}
                                            whileTap={{ scale: 0.97 }}
                                            onClick={() => {
                                                if (esMobile) setOpen(false)
                                                navigate(item.ruta)
                                            }}
                                            className={`flex items-center gap-3 px-5 py-3 mx-2 my-1 rounded-xl cursor-pointer transition-all duration-300 ${location.pathname === item.ruta
                                                ? "bg-white text-[#502779] font-medium border-l-4 border-yellow-400"
                                                : "text-white hover:bg-gray-100 hover:text-gray-900"
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

                        <div className="border-t border-gray-200 py-4 px-4 flex flex-col gap-6 mt-auto">
                            <motion.div
                                whileHover={{ scale: 1.02 }}
                                className="flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer hover:bg-purple-800 transition"
                            >
                                <User className="text-white" size={20} />
                                {open && (
                                    <div className="flex flex-col">
                                        <span className="text-sm font-semibold text-white leading-tight">
                                            {usuario?.nombre_usuario || "Usuario"}
                                        </span>
                                        <span className="text-xs text-gray-200 truncate whitespace-nowrap overflow-hidden">
                                            {usuario?.nombre_departamento || "sin información"}
                                        </span>
                                    </div>
                                )}
                            </motion.div>

                            <motion.div
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className="flex items-center gap-3 px-3 py-2 rounded-lg text-red-400 hover:bg-red-100 cursor-pointer transition"
                                onClick={() => {
                                    cerrarSesionUsuario();
                                    navigate("/");
                                }}
                            >
                                <LogOut size={20} />
                                {open && <span className="text-sm font-medium">Cerrar sesión</span>}
                            </motion.div>
                        </div>
                    </div>
                </motion.aside>
            </div>
        </React.Fragment>
    )
}