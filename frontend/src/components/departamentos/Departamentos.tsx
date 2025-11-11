import { Building, Building2, Trash2 } from "lucide-react"
import React, { useEffect, useState } from "react"
import type { Departamento, Usuario } from "../../services/interfaces"
import { obtenerUsuarios } from "../../services/apiUsuarios"
import { obtenerDepartamentos } from "../../services/apiDepartamentos"
import { Loading } from "../Loading"
import { ErrorCarga } from "../errores/ErrorCarga"
import { AnimatePresence } from "motion/react"
import { ModalAgregarDepartamento } from "./ModalAgregarDepartamento"
import AvisoToastStack from "../AvisoToastStack"
import { useAvisos } from "../../hooks/useAvisos"
import { ModalEditarDepartamento } from "./ModalEditarDepartamento"
import { ModalEliminarDepartamento } from "./ModalEliminarDepartamento"

export const Departamentos = () => {
    const { avisos, cerrarAviso, mostrarAviso } = useAvisos()
    const [departamentos, setDepartamentos] = useState<Departamento[]>()
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(false)
    const [modalAgregarVisible, setModalAgregarVisible] = useState(false)
    const [modalEditarVisible, setModalEditarVisible] = useState(false)
    const [modalEliminarVisible, setModalEliminarVisible] = useState(false)
    const [usuarios, setUsuarios] = useState<Usuario[]>()
    const [formDepartamento, setFormDepartamento] = useState({
        nombre_departamento: ""
    })
    const [formEditDepartamento, setFormEditDepartamento] = useState({
        nombre_departamento: "",
        id_responsable: 0,
        id_departamento: 0,
    })
    const [infoDepartamento, setInfoDepartamento] = useState({
        id_departamento: 0,
        nombre_departamento: ""
    })

    const obtDepartamentos = async () => {
        try {
            const respuesta = await obtenerDepartamentos()
            if (respuesta.ok) setDepartamentos(respuesta.departamentos)
            else setError(true)
        } catch (error) {
            setError(true)
        }
    }

    const obtUsuarios = async () => {
        try {
            const respuesta = await obtenerUsuarios()
            if (respuesta.ok) setUsuarios(respuesta.usuarios)
            else setError(true)
        } catch (error) {
            setError(true)
        }
    }

    useEffect(() => {
        const cargarDatos = async () => {
            setLoading(true);
            try {
                await Promise.all([
                    obtDepartamentos(),
                    obtUsuarios()
                ]);
            } catch (error) {
                setError(true);
            } finally {
                setLoading(false);
            }
        };

        cargarDatos();
    }, [])

    return (
        <React.Fragment>
            <div className="w-full px-4 md:px-8 pt-10 md:py-0.5 overflow-hidden">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                    <h2 className="text-2xl font-bold text-[#502779] md:mb-4">Departamentos</h2>
                    <button
                        onClick={() => setModalAgregarVisible(true)}
                        className="flex items-center justify-center gap-2 bg-[#502779] text-white px-4 py-2 rounded-lg hover:bg-[#3d1e5a] transition w-full md:w-auto cursor-pointer"
                    >

                        <Building className="w-4 h-4" />
                        <span className="text-sm">Agregar Departamento</span>
                    </button>
                </div>
            </div>

            <div className="grid sm:grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 px-4">
                {(departamentos ?? []).map((dpto) => (
                    <div
                        key={dpto.id_departamento}
                        className={`flex justify-between items-stretch border border-purple-200 rounded-2xl shadow hover:shadow-md transition cursor-pointer overflow-hidden ${dpto.nombre_usuario ? "bg-purple-50" : "bg-red-100 border-red-100"
                            }`}
                        onClick={() => {
                            if (!dpto.id_responsable) dpto.id_responsable = 0;

                            setFormEditDepartamento({
                                nombre_departamento: dpto.nombre_departamento,
                                id_responsable: dpto.id_responsable,
                                id_departamento: dpto.id_departamento
                            });

                            setInfoDepartamento({
                                nombre_departamento: dpto.nombre_departamento,
                                id_departamento: dpto.id_departamento,
                            });

                            setModalEditarVisible(true);
                        }}
                    >
                        <div className="flex items-center flex-1 p-4">
                            <div className="p-2 rounded-full mr-3">
                                <Building2
                                    className={`w-6 h-6 ${dpto.nombre_usuario ? "text-purple-700" : "text-red-500"}`}
                                />
                            </div>

                            <div className="flex-1 min-w-0">
                                <h3 className="text-base sm:text-lg font-semibold truncate whitespace-nowrap overflow-hidden">
                                    {dpto.nombre_departamento}
                                </h3>
                                <p className="text-sm text-gray-700 truncate">
                                    {dpto.nombre_usuario
                                        ? `${dpto.nombre_usuario} ${dpto.apellidos_usuario}`
                                        : "Sin responsable"}
                                </p>
                            </div>
                        </div>

                        {![1, 2, 3].includes(dpto.id_departamento) && (
                            <div className="flex flex-col justify-stretch h-full w-18">
                                <button
                                    className={`flex flex-col items-center justify-center w-full h-full rounded-none font-medium transition duration-200 text-base ${dpto.cantidad_usuarios === 0
                                        ? "bg-red-100 text-red-600 hover:bg-red-200 cursor-pointer"
                                        : !dpto.id_responsable
                                            ? "bg-red-100 text-gray-400 cursor-not-allowed"
                                            : "bg-purple-50 text-gray-400 cursor-not-allowed"
                                        }`}
                                    disabled={dpto.cantidad_usuarios > 0}
                                    title={
                                        dpto.cantidad_usuarios > 0
                                            ? "No se puede eliminar un departamento con usuarios asignados"
                                            : "Eliminar departamento"
                                    }
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setInfoDepartamento({
                                            nombre_departamento: dpto.nombre_departamento,
                                            id_departamento: dpto.id_departamento,
                                        });
                                        setModalEliminarVisible(true);
                                    }}
                                >
                                    <Trash2 className="w-6 h-6" />
                                </button>
                            </div>
                        )}

                    </div>
                ))}
            </div>

            <AnimatePresence>
                {modalAgregarVisible && (
                    <ModalAgregarDepartamento
                        mostrarAviso={mostrarAviso}
                        formDepartamento={formDepartamento}
                        setFormDepartamento={setFormDepartamento}
                        cerrarModal={() => setModalAgregarVisible(false)}
                    />
                )}
            </AnimatePresence>

            <AnimatePresence>
                {modalEditarVisible && (
                    <ModalEditarDepartamento 
                        usuarios={usuarios ?? []}
                        formDepartamento={formEditDepartamento}
                        infoDepartamento={infoDepartamento}
                        setFormDepartamento={setFormEditDepartamento}
                        cerrarModal={()=>setModalEditarVisible(false)}
                        mostrarAviso={mostrarAviso}
                    />
                )}
            </AnimatePresence>

            <AnimatePresence>
                {modalEliminarVisible && (
                    <ModalEliminarDepartamento 
                        infoDepartamento={infoDepartamento}
                        cerrarModal={()=>setModalEliminarVisible(false)}
                        mostrarAviso={mostrarAviso}
                    />
                )}
            </AnimatePresence>

            <AvisoToastStack
                avisos={avisos}
                onClose={cerrarAviso}
            />

            <AnimatePresence>
                {loading && (
                    <Loading />
                )}
            </AnimatePresence>

            {error && (
                <ErrorCarga mensaje="No se pudieron cargar los departamentos... intente de nuevo." />
            )}
        </React.Fragment>
    )
}