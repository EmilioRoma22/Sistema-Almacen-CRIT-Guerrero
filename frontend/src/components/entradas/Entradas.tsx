import { BoxesIcon, Plus, Search } from "lucide-react"
import React, { useEffect, useState } from "react"
import { useAuth } from "../../contexts/AuthContext"
import { useAvisos } from "../../hooks/useAvisos"
import { useNavigate } from "react-router-dom"
import { obtenerCategorias } from "../../services/apiCategorias"
import type { Categoria } from "../../services/interfaces"
import AvisoToastStack from "../AvisoToastStack"
import { Loading } from "../Loading"
import { ErrorCarga } from "../errores/ErrorCarga"
import { AnimatePresence } from "motion/react"

export const Entradas = () => {
    const { usuario } = useAuth()
    const navigate = useNavigate()
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(false)
    const [busqueda, setBusqueda] = useState("")
    const [modoAgregarActivo, setModoAgregarActivo] = useState(false)
    const { avisos, mostrarAviso, cerrarAviso } = useAvisos();
    const [categorias, setCategorias] = useState<Categoria[]>()
    const opciones_categorias = (categorias ?? []).filter(categoria => categoria.id_categoria !== 3)
    const [categoriaSeleccionada, setCategoriaSeleccionada] = useState("todas")
    const [modalResguardarVisible, setModalResguardarVisible] = useState(false)
    const [modalEntregaVisible, setModalEntregaVisible] = useState(false)
    const [historialEntradasVisible, setHistorialEntradasVisible] = useState(false)
    const [modalGenerarReporteVisible, setGenerarReporteVisible] = useState(false)
    const [entrada, setEntrada] = useState({
        nombre_producto: "",
        id_producto: 0,
        id_entrada: 0,
        cantidad: 0
    })
    const handleChange = (
        e: React.ChangeEvent<HTMLSelectElement>
    ) => {
        const { value } = e.target;
        setCategoriaSeleccionada(value)
    };

    const obtCategorias = async () => {
        try {
            const respuesta = await obtenerCategorias()
            if (respuesta.ok) setCategorias(respuesta.categorias)
            else setError(true)
        } catch (error) {
            setError(true)
        }
    }

    useEffect(() => {
        setLoading(true)
        Promise.all([
            obtCategorias(),
        ])
        setLoading(false)
    }, [])

    return (
        <React.Fragment>
            <div className="w-full px-4 md:px-8 py-10 md:py-0.5 overflow-hidden">
                <h1 className="text-2xl font-bold text-[#502779] mb-4">Entradas</h1>
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-8">
                    <div className="flex flex-col md:flex-row md:items-center grow gap-2 min-w-0">
                        <div className="grow min-w-0">
                            <label className='text-gray-500 mb-2 block truncate whitespace-nowrap overflow-hidden'>Busca alguna entrada de material</label>
                            <div className="flex items-center border border-gray-300 rounded-lg px-3 w-full">
                                <Search className="w-5 h-5 text-[#502779] mr-2 shrink-0" />
                                <input
                                    type="text"
                                    value={busqueda}
                                    onChange={(e) => setBusqueda(e.target.value)}
                                    className="w-full py-2 outline-none bg-transparent"
                                    autoFocus
                                />
                            </div>
                        </div>
                        <div className="">
                            <label className='text-gray-500 block mb-2'>Categoria</label>
                            <select
                                name="categoriaSeleccionada"
                                value={categoriaSeleccionada}
                                onChange={handleChange}
                                className="border border-gray-300 rounded-lg px-3 py-2 w-full"
                            >
                                <option value="todas" key="todas">Todas</option>
                                {opciones_categorias.map(categoria => (
                                    <option key={categoria.nombre_categoria} value={categoria.nombre_categoria}>
                                        {categoria.nombre_categoria}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="w-full md:w-auto self-end mt-2 md:mt-0 flex shrink-0 gap-2">
                            <button
                                className="flex items-center justify-center gap-2 bg-gray-100 text-[#502779] px-4 py-2 rounded-lg hover:bg-gray-200 transition w-full md:w-auto cursor-pointer"
                                title="Historial de entradas"
                                onClick={() => setHistorialEntradasVisible(true)}
                            >
                                <BoxesIcon className="w-5 h-5" />
                                <p className="lg:hidden md:hidden">Historial</p>
                            </button>

                            <button
                                className="flex items-center justify-center gap-2 bg-[#502779] text-white px-4 py-2 rounded-lg hover:bg-[#3d1e5a] transition w-full md:w-auto cursor-pointer"
                                onClick={() => { setModoAgregarActivo(true) }}
                            >
                                <Plus className="w-5 h-6.5" />
                                <span>Agregar</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <AnimatePresence>
                {loading && (
                    <Loading />
                )}
            </AnimatePresence>

            {error && (
                <ErrorCarga />
            )}

            <AvisoToastStack
                avisos={avisos}
                onClose={cerrarAviso}
            />
        </React.Fragment>
    )
}