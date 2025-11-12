import logo_teleton from '../assets/teleton_logo.svg';
import { useEffect, useRef, useState } from "react";
import { iniciarSesion } from "../services/apiUsuarios";
import { Loading } from './Loading';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeClosed } from 'lucide-react';
import AvisoToastStack from './AvisoToastStack';
import { useAvisos } from '../hooks/useAvisos';
import { useAuth } from '../contexts/AuthContext';

const Login = () => {
    const [FormDatos, setFormDatos] = useState({
        correo_usuario: "",
        password_usuario: ""
    });
    const [errores, setErrores] = useState({
        correo_usuario: "",
        password_usuario: ""
    });
    const inputRef = {
        correo_usuario: useRef<HTMLInputElement>(null),
        password_usuario: useRef<HTMLInputElement>(null),
    };
    const [_loading, setLoading] = useState(false);
    const [mostrarContraseña, setMostrarContraseña] = useState(false);
    const { avisos, cerrarAviso, mostrarAviso } = useAvisos()
    const navigate = useNavigate()
    const { setUsuario, loading, usuario } = useAuth()

    useEffect(() => {
        if (!loading && usuario) {
            if (usuario.id_departamento === 1) navigate("/usuarios");
            else if (usuario.id_departamento === 2) navigate("/entradas");
            else if (usuario.id_departamento === 3) navigate("/entregas");
            else navigate("/usuarios");
        }
    }, [usuario, loading]);

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
            correo_usuario: "",
            password_usuario: ""
        };

        if (FormDatos.correo_usuario === "") nuevosErrores.correo_usuario = "Debe ingresar su correo";
        if (FormDatos.password_usuario === "") nuevosErrores.password_usuario = "Debe ingresar su contraseña";
        setErrores(nuevosErrores);

        const hayErrores = Object.values(nuevosErrores).some(error => error !== "");
        if (hayErrores) {
            setLoading(false);
            return;
        }

        try {
            const resultado = await iniciarSesion(FormDatos);

            if (resultado.ok) {
                setUsuario(resultado.usuario);

                if (resultado.usuario.id_departamento === 1) navigate("/usuarios");
                else if (resultado.usuario.id_departamento === 2) navigate("/entradas");
                else navigate("/resguardos");
            } else {
                setErrores(prev => ({
                    ...prev, password_usuario: resultado.message || "`"
                }))
                setLoading(false);
            }
        } catch (error) {
            mostrarAviso("Error al iniciar sesión. Por favor, inténtalo de nuevo más tarde.", "error");
            setLoading(false);
        }
    };

    return (
        <>
            <div className="w-full h-screen flex flex-col md:flex-row overflow-auto">
                <div className="w-full md:w-1/2 h-full bg-white flex items-center justify-center p-6">
                    <img src={logo_teleton} alt="Logo" className="w-2/3 md:w-1/2 h-auto" />
                </div>
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
                                className="w-full rounded-lg px-3 py-4 text-black bg-white border focus:ring-1 focus:ring-yellow-300 focus:outline-none"
                                placeholder="Ingresa tu correo"
                            />
                            {errores.correo_usuario && (
                                <div
                                    key="correo_usuario_error"
                                    className="mb-4"
                                >
                                    <p className="bg-red-500/30 text-white text-sm p-2 rounded-md text-center mt-3">
                                        {errores.correo_usuario}
                                    </p>
                                </div>
                            )}
                        </div>

                        <div>
                            <label htmlFor="contraseña_usuario" className="block mb-2">Contraseña</label>
                            <div className="relative w-full">
                                <input
                                    ref={inputRef.password_usuario}
                                    type={mostrarContraseña ? "text" : "password"}
                                    id="password_usuario"
                                    name="password_usuario"
                                    onChange={handleInputChange}
                                    value={FormDatos.password_usuario}
                                    className="w-full rounded-lg px-3 py-4 text-black bg-white pr-10 border focus:ring-1 focus:ring-yellow-300 focus:outline-none"
                                    placeholder="••••••••"
                                />
                                {FormDatos.password_usuario.length > 0 && (
                                    <button
                                        type="button"
                                        onClick={() => { setMostrarContraseña(prev => !prev); }}
                                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                                    >
                                        {mostrarContraseña ? <Eye className='text-[#502779]' /> : <EyeClosed className='text-[#502779]' />}
                                    </button>
                                )}
                            </div>
                            {errores.password_usuario && (
                                <div
                                    key="contraseña_usuario_error"
                                    className="mb-4"
                                >
                                    <p className="bg-red-500/30 text-white text-sm p-2 rounded-md text-center mt-3">
                                        {errores.password_usuario}
                                    </p>
                                </div>
                            )}
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
            </div>

            <AvisoToastStack avisos={avisos} onClose={cerrarAviso} />
            {(_loading || loading) && (
                <Loading />
            )}
        </>
    )
}

export default Login;