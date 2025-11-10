import { motion } from "framer-motion";
import { Eye, EyeClosed, UserPen } from "lucide-react";
import { useEffect, useState, type ChangeEvent, type FormEvent } from "react";
import { Loading } from "../Loading";
import { actualizar_usuario } from "../../services/api";
import type { Departamento } from "../../services/interfaces";
import { useIsMobile } from "../../hooks/useEsMobile";

type FormUsuario = {
    nombre_usuario: string
    apellidos_usuario: string
    correo_usuario: string
    id_usuario: number
    id_departamento: number
};

type InfoUsuario = {
    esResponsable: boolean,
    nombre_usuario: string;
    apellidos_usuario: string;
}

type Props = {
    cerrarModal: () => void
    mostrarAviso: (mensaje: string, tipo: "error" | "success" | "aviso") => void
    formUsuario: FormUsuario;
    setFormUsuario: React.Dispatch<React.SetStateAction<FormUsuario>>;
    infoUsuario: InfoUsuario;
    departamentos: Departamento[]
};

const ModalModificarUsuario = ({ cerrarModal, mostrarAviso, formUsuario, setFormUsuario, infoUsuario, departamentos }: Props) => {
    const [loading, setLoading] = useState(false);
    const esMobile = useIsMobile()
    const [formContraseña, setFormContraseña] = useState({
        contraseña_usuario: "",
        confirmar_contraseña: ""
    })
    const [mostrarContraseña, setMostrarContraseña] = useState(false);
    const [mostrarConfirmarContraseña, setMostrarConfirmarContraseña] = useState(false);
    const [errores, setErrores] = useState({
        nombre_usuario: "",
        apellidos_usuario: "",
        correo_usuario: "",
        id_departamento: "",
        contraseña_usuario: "",
        confirmar_contraseña: ""
    })
    const [cambios, setCambios] = useState(false);

    useEffect(() => {
    }, [formUsuario]);

    async function confirmarEditarUsuario(event: FormEvent<HTMLFormElement>): Promise<void> {
        event.preventDefault();
        if (!cambios) {
            mostrarAviso("Debes cambiar la información", "error");
            return;
        }
        setLoading(true);

        const nuevosErrores = {
            nombre_usuario: "",
            apellidos_usuario: "",
            correo_usuario: "",
            id_departamento: "",
            contraseña_usuario: "",
            confirmar_contraseña: ""
        };

        if (!formUsuario.nombre_usuario.trim()) nuevosErrores.nombre_usuario = "Nombre requerido";
        if (!formUsuario.apellidos_usuario.trim()) nuevosErrores.apellidos_usuario = "Apellidos requeridos";
        if (!formUsuario.correo_usuario.trim()) nuevosErrores.correo_usuario = "Se requiere correo electrónico";
        if (formUsuario.id_departamento == 0) nuevosErrores.id_departamento = "Seleccione un departamento";

        if (formContraseña.contraseña_usuario || formContraseña.confirmar_contraseña) {
            if (!formContraseña.contraseña_usuario || formContraseña.contraseña_usuario.length < 4) nuevosErrores.contraseña_usuario = "Mínimo 4 caracteres";
            else if (formContraseña.contraseña_usuario !== formContraseña.confirmar_contraseña) nuevosErrores.confirmar_contraseña = "Las contraseñas no coinciden";
        }

        const hayErrores = Object.values(nuevosErrores).some(error => error !== "");

        if (hayErrores) {
            setErrores(nuevosErrores);
            setLoading(false);
            return;
        }

        const newForm = {
            ...formUsuario,
            new_password: formContraseña.contraseña_usuario
        }

        try {
            const resultado = await actualizar_usuario(newForm);

            if (resultado.ok) {
                mostrarAviso(resultado.message || "Usuario editado correctamente", "success");
                cerrarModal();
            } else {
                mostrarAviso(resultado.message || "", "error");
            }
        } catch (error) {
            mostrarAviso("No se ha podido modificar el usuario. Intente más tarde.", "error");
        } finally {
            setLoading(false);
        }
    }

    function handleChange(event: ChangeEvent<HTMLInputElement | HTMLSelectElement>): void {
        const { name, value } = event.target

        setFormUsuario(prev => ({
            ...prev,
            [name]: name === "id_departamento" ? Number(value) : value
        }));

        setErrores({ ...errores, [name]: "" })
        setCambios(true);
    }

    function handleChangeContraseña(event: ChangeEvent<HTMLInputElement>): void {
        const { name, value } = event.target

        setFormContraseña({
            ...formContraseña, [name]: value
        })

        setCambios(true);
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

    return (
        <motion.div
            className="modal-background fixed z-50 inset-0 bg-black/40 flex justify-center items-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onMouseDown={(e) => {
                if ((e.target as HTMLElement).classList.contains("modal-background")) {
                    cerrarModal();
                }
            }}
        >
            <motion.div
                className="bg-white p-6 rounded-2xl w-[400px] shadow-2xl border border-gray-200"
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                transition={{ duration: 0.2 }}
            >
                <div className="flex justify-center mb-4">
                    <div className="bg-purple-200 p-3 rounded-full">
                        <UserPen className="text-[#502779] w-6 h-6" />
                    </div>
                </div>

                <form action="" onSubmit={confirmarEditarUsuario} className='space-y-4'>
                    <div>
                        <label className="block text-lg font-medium text-gray-700 text-center mb-4">Editar el usuario <strong>{infoUsuario.nombre_usuario} {infoUsuario.apellidos_usuario}</strong></label>
                        <div className='flex gap-4'>
                            <div className='w-full'>
                                <label className="block text-sm font-medium text-gray-700 text-center">Nombre</label>
                            </div>
                            <div className='w-full'>
                                <label className="block text-sm font-medium text-gray-700 text-center">Apellidos</label>
                            </div>
                        </div>

                        <div>
                            <div className='flex gap-4'>
                                <input
                                    type="text"
                                    value={formUsuario.nombre_usuario}
                                    name="nombre_usuario"
                                    className="mt-3 w-full px-4 py-2 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-300"
                                    placeholder="Nombre"
                                    onChange={handleChange}
                                    autoFocus={!esMobile}
                                />
                                <input
                                    type="text"
                                    value={formUsuario.apellidos_usuario}
                                    name="apellidos_usuario"
                                    className="mt-3 w-full px-4 py-2 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-300"
                                    placeholder="Apellidos"
                                    onChange={handleChange}
                                />
                            </div>

                            <div className='flex gap-4'>
                                <div className='w-full'>
                                    {errores.nombre_usuario && (
                                        <motion.div
                                            key="nombre_usuario_error"
                                            initial={{ opacity: 0, y: -10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -10 }}
                                            transition={{ duration: 0.4, ease: "easeOut" }}
                                        >
                                            <p className="text-red-600 text-sm p-2 rounded-md text-center">
                                                {errores.nombre_usuario}
                                            </p>
                                        </motion.div>
                                    )}
                                </div>

                                <div className='w-full'>
                                    {errores.apellidos_usuario && (
                                        <motion.div
                                            key="apellidos_usuario_error"
                                            initial={{ opacity: 0, y: -10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -10 }}
                                            transition={{ duration: 0.4, ease: "easeOut" }}
                                        >
                                            <p className="text-red-600 text-sm p-2 rounded-md text-center">
                                                {errores.apellidos_usuario}
                                            </p>
                                        </motion.div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 text-center">Correo electrónico</label>
                        <input
                            type="email"
                            value={formUsuario.correo_usuario}
                            name="correo_usuario"
                            className="mt-3 w-full px-4 py-2 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-300"
                            placeholder="Correo electrónico"
                            onChange={handleChange}
                        />
                        {errores.correo_usuario && (
                            <motion.div
                                key="correo_usuario_error"
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                transition={{ duration: 0.4, ease: "easeOut" }}
                            >
                                <p className="text-red-600 text-sm p-2 rounded-md text-center">
                                    {errores.correo_usuario}
                                </p>
                            </motion.div>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 text-center">Departamento</label>
                        <select
                            name="id_departamento"
                            value={formUsuario.id_departamento}
                            onChange={handleChange}
                            disabled={infoUsuario.esResponsable}
                            className={`mt-3 w-full px-4 py-2 border border-gray-300 ${infoUsuario.esResponsable ? "bg-gray-200 text-gray-400" : ""} rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-300`}
                        >
                            <option value="0" key="0">Seleccionar departamento</option>
                            {departamentos.map(dep => (
                                <option key={dep.id_departamento} value={dep.id_departamento}>
                                    {dep.nombre_departamento}
                                </option>
                            ))}
                        </select>
                        {errores.id_departamento && (
                            <motion.div
                                key="id_departamento_error"
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                transition={{ duration: 0.4, ease: "easeOut" }}
                            >
                                <p className="text-red-600 text-sm p-2 rounded-md text-center">
                                    {errores.id_departamento}
                                </p>
                            </motion.div>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 text-center">Cambiar contraseña.</label>
                        <label className="block text-sm font-medium text-red-500 text-center mb-3">Si no se cambiará la contraseña deje los espacios en blanco.</label>
                        <div className='flex gap-4 mb-3'>
                            <div className='w-full'>
                                <label className="block text-sm font-medium text-gray-700 text-center">Contraseña</label>
                            </div>
                            <div className='w-full'>
                                <label className="block text-sm font-medium text-gray-700 text-center">Confirmar contraseña</label>
                            </div>
                        </div>

                        <div className='flex gap-4'>
                            <div className="relative w-full">
                                <input
                                    type={mostrarContraseña ? "text" : "password"}
                                    value={formContraseña.contraseña_usuario}
                                    name="contraseña_usuario"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-300"
                                    placeholder="Contraseña"
                                    onChange={handleChangeContraseña}
                                />
                                {formContraseña.contraseña_usuario.length > 0 && (
                                    <button
                                        type="button"
                                        onClick={() => { setMostrarContraseña(prev => !prev); }}
                                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                                    >
                                        {mostrarContraseña ? <Eye className='text-[#502779]' /> : <EyeClosed className='text-[#502779]' />}
                                    </button>
                                )}
                            </div>
                            <div className="relative w-full">
                                <input
                                    type={mostrarConfirmarContraseña ? "text" : "password"}
                                    value={formContraseña.confirmar_contraseña}
                                    name="confirmar_contraseña"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-300"
                                    placeholder="Contraseña"
                                    onChange={handleChangeContraseña}
                                />
                                {formContraseña.confirmar_contraseña.length > 0 && (
                                    <button
                                        type="button"
                                        onClick={() => { setMostrarConfirmarContraseña(prev => !prev); }}
                                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                                    >
                                        {mostrarConfirmarContraseña ? <Eye className='text-[#502779]' /> : <EyeClosed className='text-[#502779]' />}
                                    </button>
                                )}
                            </div>

                        </div>

                        <div className='flex gap-4'>
                            <div className='w-full'>
                                {errores.contraseña_usuario && (
                                    <motion.div
                                        key="contraseña_usuario_error"
                                        initial={{ opacity: 0, y: -10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -10 }}
                                        transition={{ duration: 0.4, ease: "easeOut" }}
                                    >
                                        <p className="text-red-600 text-sm p-2 rounded-md text-center">
                                            {errores.contraseña_usuario}
                                        </p>
                                    </motion.div>
                                )}
                            </div>

                            <div className='w-full'>
                                {errores.confirmar_contraseña && (
                                    <motion.div
                                        key="confirmar_contraseña_error"
                                        initial={{ opacity: 0, y: -10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -10 }}
                                        transition={{ duration: 0.4, ease: "easeOut" }}
                                    >
                                        <p className="text-red-600 text-sm p-2 rounded-md text-center">
                                            {errores.confirmar_contraseña}
                                        </p>
                                    </motion.div>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-center gap-4 mt-6">
                        <button
                            className="bg-[#502779] text-white px-4 py-2 rounded-md hover:bg-[#3d1e5a]  shadow-sm transition-colors ease-in-out duration-200 cursor-pointer"
                            type='submit'
                        >
                            Guardar
                        </button>
                        <button
                            type='button'
                            onClick={() => {
                                cerrarModal();
                            }}
                            className="bg-gray-200 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-300 shadow-sm transition-colors ease-in-out duration-200 cursor-pointer"
                        >
                            Cancelar
                        </button>
                    </div>
                </form>

                {loading && (
                    <Loading mensaje="Guardando usuario..." />
                )}
            </motion.div>
        </motion.div>
    )
}

export default ModalModificarUsuario;