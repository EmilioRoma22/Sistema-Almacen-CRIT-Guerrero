import { useEffect, useState, type ChangeEvent, type FormEvent } from "react"
import { Loading } from "../Loading"
import { motion } from "framer-motion"
import { Edit } from "lucide-react"
import Select from 'react-select';
import Error from "../errores/Error"
import { editarDepartamento } from "../../services/apiDepartamentos";
import type { Usuario } from "../../services/interfaces";
import { useIsMobile } from "../../hooks/useEsMobile";

type FormDepartamento = {
    nombre_departamento: string,
    id_responsable: number,
    id_departamento: number
}

type InfoDepartamento = {
    nombre_departamento: string
    id_departamento: number
}

type Props = {
    cerrarModal: () => void
    formDepartamento: FormDepartamento
    mostrarAviso: (mensaje: string, tipo: "error" | "success" | "aviso") => void
    setFormDepartamento: React.Dispatch<React.SetStateAction<FormDepartamento>>;
    infoDepartamento: InfoDepartamento;
    usuarios: Usuario[]
}

export const ModalEditarDepartamento = ({ cerrarModal, formDepartamento, setFormDepartamento, infoDepartamento, mostrarAviso, usuarios }: Props) => {
    const [loading, setLoading] = useState(false)
    const [errorServidor, setErrorServidor] = useState(false)
    const esMobile = useIsMobile()
    const [errores, setErrores] = useState({
        nombre_departamento: "",
    })
    const customStyles = {
        control: (provided: any, state: { isFocused: any }) => ({
            ...provided,
            borderRadius: '0.75rem',
            borderColor: state.isFocused ? '#a78bfa' : '#d1d5db',
            boxShadow: 'none',
            paddingLeft: '1rem',
            paddingRight: '1rem',
            minHeight: '2.5rem',
            cursor: 'pointer',
        }),
        menu: (provided: any) => ({
            ...provided,
            borderRadius: '0.75rem',
            overflow: 'hidden',
        }),
        option: (provided: any, state: { isFocused: any }) => ({
            ...provided,
            backgroundColor: state.isFocused ? '#ede9fe' : 'white',
            color: state.isFocused ? '#5b21b6' : 'black',
            cursor: 'pointer',
        }),
        placeholder: (provided: any) => ({
            ...provided,
            color: '#6b7280',
        }),
        singleValue: (provided: any) => ({
            ...provided,
            color: 'black',
        }),
    };

    async function modificarDepartamento(event: FormEvent<HTMLFormElement>): Promise<void> {
        event.preventDefault();
        setLoading(true)
        const nuevosErrores = { nombre_departamento: "" }

        if (formDepartamento.nombre_departamento === "") nuevosErrores.nombre_departamento = "Debe colocar un nombre al departamento";

        const hayErrores = Object.values(nuevosErrores).some(error => error !== "");
        if (hayErrores) {
            setErrores(nuevosErrores);
            setLoading(false);
            return;
        }

        try {
            const respuesta = await editarDepartamento(formDepartamento)

            if (respuesta.ok) {
                mostrarAviso(respuesta.message || "Departamento modificado correctamente", "success")
                cerrarModal()
            } else {
                mostrarAviso(respuesta.message || "El departamento no se ha podido modificar", "error")
            }
        } catch (error) {
            console.error(error)
            setErrorServidor(true)
        } finally {
            setLoading(false)
        }
    }

    function handleChange(event: ChangeEvent<HTMLInputElement>): void {
        const { value, name } = event.target;

        setFormDepartamento(prev => ({
            ...prev,
            [name]: name === "id_responsable" ? Number(value) : value
        }));
    }

    const opcionesUsuarios = usuarios.map(usuario => ({
        value: usuario.id_usuario.toString(),
        label: `${usuario.nombre_usuario} ${usuario.apellidos_usuario}`,
        id_departamento: usuario.id_departamento.toString()
    }));

    const opcionesUsuariosFiltradas = opcionesUsuarios.filter(
        usuario => usuario.id_departamento === infoDepartamento.id_departamento.toString()
    );

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


    if (errorServidor) return (
        <>
            <div className="fixed z-50 inset-0 bg-white flex justify-center items-center">
                <Error />
            </div>
        </>
    )

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
                            <Edit className="text-[#502779] w-6 h-6" />
                        </div>
                    </div>

                    <div>
                        <label className="block text-lg font-medium text-gray-700 text-center mb-4">Editar el departamento "{infoDepartamento.nombre_departamento}"</label>
                    </div>

                    <form action="" onSubmit={modificarDepartamento} className="space-y-8">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 text-center">Nombre del departamento</label>
                            <input
                                type="text"
                                value={formDepartamento.nombre_departamento}
                                name="nombre_departamento"
                                className="mt-3 w-full px-4 py-2 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-300"
                                placeholder="Nombre del departamento"
                                onChange={handleChange}
                                autoFocus={!esMobile}
                            />
                            {errores.nombre_departamento && (
                                <motion.div
                                    key="correo_usuario_error"
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    transition={{ duration: 0.4, ease: "easeOut" }}
                                    className="mb-4"
                                >
                                    <p className="text-red-600 text-sm p-2 rounded-md text-center mt-3">
                                        {errores.nombre_departamento}
                                    </p>
                                </motion.div>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 text-center">Encargado del departamento</label>
                            <Select
                                options={
                                    opcionesUsuariosFiltradas.length > 0
                                        ? [{ value: "0", label: "No asignar encargado" }, ...opcionesUsuariosFiltradas]
                                        : [{ value: "0", label: "No hay usuarios en el departamento" }]
                                }
                                value={
                                    opcionesUsuariosFiltradas.length > 0
                                        ? (
                                            formDepartamento.id_responsable != null
                                                ? (opcionesUsuariosFiltradas.find(op => op.value === formDepartamento.id_responsable.toString()) ||
                                                    { value: "0", label: "No asignar encargado" })
                                                : { value: "0", label: "No asignar encargado" }
                                        )
                                        : { value: "0", label: "No hay usuarios en el departamento" }
                                }
                                onChange={selected => {
                                    if (!selected) return
                                    setFormDepartamento(prev => ({
                                        ...prev,
                                        id_responsable: Number(selected.value)
                                    }))
                                }}

                                className="mt-3 text-left rounded-xl"
                                classNamePrefix="react-select"
                                styles={customStyles}
                            />
                        </div>

                        <div className="flex justify-center gap-4 mt-10">
                            <button
                                type="submit"
                                className="bg-[#502779] text-white px-4 py-2 rounded-md hover:bg-[#3d1e5a]  shadow-sm transition-colors ease-in-out duration-200 cursor-pointer"
                            >
                                Confirmar
                            </button>
                            <button
                                type="button"
                                onClick={() => {
                                    cerrarModal();
                                }}
                                className="bg-gray-200 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-300 shadow-sm transition-colors ease-in-out duration-200 cursor-pointer"
                            >
                                Cancelar
                            </button>
                        </div>
                    </form>

                    {loading && (<Loading mensaje="Modificando departamento..." />)}
                </motion.div>
            </motion.div>
    );
}