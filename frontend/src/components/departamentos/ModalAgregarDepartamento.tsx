import { motion } from "framer-motion";
import { Building2Icon } from "lucide-react";
import { useEffect, useState, type FormEvent } from "react";
import { Loading } from "../Loading";
import { crearDepartamento } from "../../services/apiDepartamentos";
import { useIsMobile } from "../../hooks/useEsMobile";

type FormDepartamento = {
    nombre_departamento: string
}

type Props = {
    cerrarModal: () => void
    mostrarAviso: (mensaje: string, tipo: "error" | "success" | "aviso") => void
    formDepartamento: FormDepartamento;
    setFormDepartamento: React.Dispatch<React.SetStateAction<FormDepartamento>>;
}

export const ModalAgregarDepartamento = ({ cerrarModal, mostrarAviso, formDepartamento, setFormDepartamento }: Props) => {
    const [loading, setLoading] = useState(false)
    const [errores, setErrores] = useState({ nombre_departamento: "" })
    const esMobile = useIsMobile()

    async function registrarDepartamento(event: FormEvent<HTMLFormElement>): Promise<void> {
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
            const respuesta = await crearDepartamento(formDepartamento)

            if (respuesta.ok) {
                mostrarAviso(respuesta.message || "Departamento guardado correctamente", "success")
                setFormDepartamento({ nombre_departamento: "" })
                cerrarModal()
            } else {
                mostrarAviso(respuesta.message || "No se ha podido crear el departamento", "error")
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;

        setFormDepartamento({
            ...formDepartamento,
            [name]: value,
        });

        setErrores({ ...errores, [name]: "" });
    };

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
                        <Building2Icon className="text-[#502779] w-6 h-6" />
                    </div>
                </div>

                <form action="" className="space-y-4" onSubmit={registrarDepartamento}>
                    <label className="block text-lg font-medium text-gray-700 text-center">Agregar un nuevo departamento</label>
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
                            <div
                                key="correo_usuario_error"
                                className="mb-4"
                            >
                                <p className="text-red-600 text-sm p-2 rounded-md text-center mt-3">
                                    {errores.nombre_departamento}
                                </p>
                            </div>
                        )}
                    </div>
                    <div className="flex justify-center gap-4 mt-10">
                        <button
                            className="bg-[#502779] text-white px-4 py-2 rounded-md hover:bg-[#3d1e5a]  shadow-sm transition-colors ease-in-out duration-200 cursor-pointer"
                            type="submit"
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

                {loading && (<Loading mensaje="Guardando departamento..." />)}

            </motion.div>
        </motion.div>
    )

}