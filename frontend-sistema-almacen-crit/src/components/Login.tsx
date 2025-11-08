import logo_teleton from '../assets/teleton_logo.svg';
import { useEffect, useRef, useState } from "react";
import { cerrarSesion, iniciarSesion } from "../services/api";
import { type TokenPayload } from '../services/interfaces';
import { Loading } from './Loading';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from "jwt-decode";
import { AnimatePresence, motion } from 'motion/react';
import { Eye, EyeClosed } from 'lucide-react';
import AvisoToastStack from './AvisoToastStack';
import { useAvisos } from '../hooks/useAvisos';

const Login = () => {
    const [FormDatos, setFormDatos] = useState({
        id_departamento: 0,
        correo_usuario: "",
        contraseña_usuario: ""
    });
    const [errores, setErrores] = useState({
        id_departamento: "",
        correo_usuario: "",
        contraseña_usuario: ""
    });
    const inputRef = {
        correo_usuario: useRef<HTMLInputElement>(null),
        contraseña_usuario: useRef<HTMLInputElement>(null),
    };
    const [loading, setLoading] = useState(false);
    const [mostrarContraseña, setMostrarContraseña] = useState(false);
    const { avisos, cerrarAviso, mostrarAviso } = useAvisos()
    const navigate = useNavigate()

    useEffect(() => {
        const token = localStorage.getItem("token");
        
        if (!token) {
            return;
        }

        try {
            const decoded = jwtDecode<TokenPayload>(token);
            const ahora = Date.now() / 1000;

            if (!decoded.exp || decoded.exp < ahora) {
                cerrarSesion()
                return;
            }

            if (decoded.id_departamento === 1) navigate("/usuarios");
            else if (decoded.id_departamento === 2) navigate("/entradas");
            else if (decoded.id_departamento === 3) navigate("/entregas");
            else navigate("/resguardos");
        } catch {
            navigate("/");
        }
    }, []);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;

        setFormDatos(prev => ({
            ...prev,
            [name]: value
        }))
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);

        const nuevosErrores = {
            id_departamento: "",
            correo_usuario: "",
            contraseña_usuario: ""
        };

        if (FormDatos.id_departamento === 0) nuevosErrores.id_departamento = "Debe seleccionar un departamento";
        if (FormDatos.correo_usuario === "") nuevosErrores.correo_usuario = "Debe ingresar su correo";
        if (FormDatos.contraseña_usuario === "") nuevosErrores.contraseña_usuario = "Debe ingresar su contraseña";
        setErrores(nuevosErrores);

        const hayErrores = Object.values(nuevosErrores).some(error => error !== "");
        if (hayErrores) {
            setLoading(false);
            return;
        }

        try {
            const resultado = await iniciarSesion(FormDatos);

            if (resultado.ok && resultado.token) {
                localStorage.setItem("token", resultado.token);

                const decoded = jwtDecode<TokenPayload>(resultado.token);

                if (decoded.id_departamento === 1) navigate("/usuarios");
                else if (decoded.id_departamento === 2) navigate("/entradas");
                else navigate("/resguardos");
            } else {
                setErrores(prev => ({
                    ...prev,
                    contraseña_usuario: resultado.message || "Credenciales inválidas",
                }));
                setLoading(false);
            }
        } catch (error) {
            mostrarAviso("Error al iniciar sesión. Por favor, inténtalo de nuevo más tarde.", "error");
            setLoading(false);
        }
    };

    return (
        <>
            <motion.div
                initial={{ opacity: 0, y: 0 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                className="w-full h-screen flex flex-col md:flex-row overflow-auto"
            >
                <div className="w-full md:w-1/2 h-full bg-[#502779] flex items-center justify-center p-6">
                    <form onSubmit={handleSubmit} className="w-full max-w-2xl text-white space-y-6">
                        <h1 className="text-5xl font-bold text-center md:text-left">
                            SISTEMA DE ALMACÉN
                        </h1>

                        <div>
                            <label htmlFor="correo_usuario" className="block mb-2">Correo</label>
                            <input
                                ref={inputRef.correo_usuario}
                                type="email"
                                id="correo_usuario"
                                name="correo_usuario"
                                onChange={handleInputChange}
                                value={FormDatos.correo_usuario}
                                className="w-full rounded-lg px-3 py-4 text-black bg-white"
                                placeholder="Ingresa tu correo"
                            />
                            <AnimatePresence mode='wait'>
                                {errores.correo_usuario && (
                                    <motion.div
                                        key="correo_usuario_error"
                                        initial={{ opacity: 0, y: -10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -10 }}
                                        transition={{ duration: 0.4, ease: "easeOut" }}
                                        className="mb-4"
                                    >
                                        <p className="bg-red-500/30 text-white text-sm p-2 rounded-md text-center mt-3">
                                            {errores.correo_usuario}
                                        </p>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        <div>
                            <label htmlFor="contraseña_usuario" className="block mb-2">Contraseña</label>
                            <div className="relative w-full">
                                <input
                                    ref={inputRef.contraseña_usuario}
                                    type={mostrarContraseña ? "text" : "password"}
                                    id="contraseña_usuario"
                                    name="contraseña_usuario"
                                    onChange={handleInputChange}
                                    value={FormDatos.contraseña_usuario}
                                    className="w-full rounded-lg px-3 py-4 text-black bg-white pr-10"
                                    placeholder="••••••••"
                                />
                                {FormDatos.contraseña_usuario.length > 0 && (
                                    <button
                                        type="button"
                                        onClick={() => { setMostrarContraseña(prev => !prev); }}
                                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                                    >
                                        {mostrarContraseña ? <Eye className='text-[#502779]' /> : <EyeClosed className='text-[#502779]' />}
                                    </button>
                                )}
                            </div>
                            <AnimatePresence mode='wait'>
                                {errores.contraseña_usuario && (
                                    <motion.div
                                        key="contraseña_usuario_error"
                                        initial={{ opacity: 0, y: -10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -10 }}
                                        transition={{ duration: 0.4, ease: "easeOut" }}
                                        className="mb-4"
                                    >
                                        <p className="bg-red-500/30 text-white text-sm p-2 rounded-md text-center mt-3">
                                            {errores.contraseña_usuario}
                                        </p>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        <button
                            type="submit"
                            className="w-full mt-4 bg-yellow-400 text-[#502779] py-2 rounded-lg hover:bg-yellow-300 transition-colors duration-300 cursor-pointer"
                        >
                            Iniciar sesión
                        </button>
                        <p className='text-center text-white/60 mt-4'>®Sistema creado para la Fundación Teletón by Sandy Chavelas y Emilio Rodriguez</p>
                    </form>
                </div>

                <div className="w-full md:w-1/2 h-full bg-white flex items-center justify-center p-6">
                    <img src={logo_teleton} alt="Logo" className="w-2/3 md:w-1/2 h-auto" />
                </div>
            </motion.div>

            <AvisoToastStack avisos={avisos} onClose={cerrarAviso} />
            {loading && (
                <Loading />
            )}
        </>
    )
}

export default Login;