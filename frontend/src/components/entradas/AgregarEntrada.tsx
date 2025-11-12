import { useParams, useNavigate } from 'react-router-dom';
import { useAvisos } from '../../hooks/useAvisos';
import { useEffect, useState } from 'react';
import { v4 as uuidv4 } from "uuid";
import { useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Plus, ShoppingBag, TriangleAlert } from 'lucide-react';
import AvisoToastStack from '../AvisoToastStack';
import { Loading } from '../Loading';
import { obtenerCategorias } from '../../services/apiCategorias';
import type { Categoria, Departamento, Producto, Productos } from '../../services/interfaces';
import { obtenerDepartamentos } from '../../services/apiDepartamentos';
import { ErrorCarga } from '../errores/ErrorCarga';
import { obtenerProductos } from '../../services/apiProductos';
import { agregarEntrada, agregarResguardo } from '../../services/apiEntradas';

const AgregarEntrada = () => {
    const { id_categoria } = useParams();
    const { mostrarAviso, avisos, cerrarAviso } = useAvisos()
    const navigate = useNavigate();
    const [categorias, setCategorias] = useState<Categoria[]>()
    const categoria = (categorias ?? []).find(c => c.id_categoria.toString() === id_categoria?.toString());
    const [indiceEditando, setIndiceEditando] = useState<number | null>(null);
    const [showAutocomplete, setShowAutocomplete] = useState(false);
    const [autocompleteProductos, setAutocompleteProductos] = useState<any[]>([]);
    const [autocompleteIndex, setAutocompleteIndex] = useState<number>(-1);
    const [confirmarSalidaVisible, setConfirmarSalidaVisible] = useState(false)
    const [confirmarEntradaVisible, setConfirmarEntradaVisible] = useState(false)
    const autocompleteRefs = useRef<(HTMLDivElement | null)[]>([]);
    const [departamento, setDepartamento] = useState(0)
    const [nombreDonador, setNombreDonador] = useState("")
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(false)
    const [departamentos, setDepartamentos] = useState<Departamento[]>()
    const [productos, setProductos] = useState<Productos[]>()
    const [productosAgregados, setProductosAgregados] = useState<Producto[]>([]);
    const [productoActual, setProductoActual] = useState<Producto>({
        cantidad: "",
        unidad: "",
        nombre: "",
    });
    const inputRefs = {
        cantidad: useRef<HTMLInputElement>(null),
        unidad: useRef<HTMLInputElement>(null),
        nombre: useRef<HTMLInputElement>(null),
    };
    const opcionesDepartamentos = (departamentos ?? []).filter(
        (dep) => dep.id_departamento > 2 && dep.id_responsable !== null && dep.id_responsable !== 0
    );

    const obtCategorias = async () => {
        try {
            const respuesta = await obtenerCategorias()
            if (respuesta.ok) setCategorias(respuesta.categorias)
            else setError(true)
        } catch (error) {
            setError(true)
        }
    }

    const obtDepartamentos = async () => {
        try {
            const respuesta = await obtenerDepartamentos()
            if (respuesta.ok) setDepartamentos(respuesta.departamentos)
            else setError(true)
        } catch (error) {
            setError(true)
        }
    }

    const obtProductos = async () => {
        try {
            const respuesta = await obtenerProductos()
            if (respuesta.ok) setProductos(respuesta.productos)
            else setError(true)
        } catch (error) {
            setError(true)
        }
    }

    useEffect(() => {
        setLoading(true)
        Promise.all([
            obtCategorias(),
            obtDepartamentos(),
            obtProductos()
        ])
        setLoading(false)
    }, [])

    useEffect(() => {
        if (showAutocomplete && autocompleteIndex >= 0 && autocompleteRefs.current[autocompleteIndex]) {
            autocompleteRefs.current[autocompleteIndex]?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
        }
    }, [autocompleteIndex, showAutocomplete]);

    const agregarProducto = () => {
        if (
            !productoActual.cantidad ||
            !productoActual.unidad ||
            !productoActual.nombre ||
            productoActual.cantidad.includes("-")
        ) {
            mostrarAviso("Revisa todos los campos antes de agregar, hay datos inválidos", "aviso");
        } else {
            const productoRepetido = productosAgregados.find(producto => producto.nombre.toLowerCase().trim() === productoActual.nombre.toLowerCase().trim())

            if (productoRepetido) {
                mostrarAviso("El nombre del producto que ingresaste ya está en la lista de productos, si es un producto de otro proveedor procura colocar un identificador", "error")
            } else {
                setProductosAgregados((prev) => [
                    ...prev,
                    { ...productoActual, id: uuidv4() }
                ]);
                setProductoActual({ cantidad: "", unidad: "", nombre: "" });
                inputRefs.cantidad.current?.focus();
            }

        }
    };

    const empezarEdicion = (idx: number) => {
        setProductoActual(productosAgregados[idx]);
        setIndiceEditando(idx);
        inputRefs.cantidad.current?.focus();
    };

    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                if (indiceEditando !== null) {
                    setIndiceEditando(null);
                    setProductoActual({ cantidad: "", unidad: "", nombre: "" });
                } else if (!confirmarSalidaVisible && !confirmarEntradaVisible) {
                    if (productosAgregados.length > 0) {
                        setConfirmarSalidaVisible(true);
                    } else {
                        navigate('/entradas');
                    }
                } else {
                    setConfirmarSalidaVisible(false);
                    setConfirmarEntradaVisible(false);
                }
            }
        };

        window.addEventListener('keydown', handleKeyDown);

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [confirmarSalidaVisible, confirmarEntradaVisible, productoActual, indiceEditando, productosAgregados]);

    return (
        <>
            <div>
                <div className="px-4 pt-8 md:pt-0 md:px-10 lg:px-20">
                    <div className="flex justify-center mb-4">
                        <div className="bg-purple-200 p-3 rounded-full">
                            <ShoppingBag className="text-[#502779] w-6 h-6" />
                        </div>
                    </div>

                    <h2 className="text-lg md:text-xl font-medium text-center text-gray-700 mb-4">
                        Agregar productos para <strong>{categoria?.nombre_categoria}</strong>
                    </h2>

                    <div className="flex flex-col gap-2 lg:grid lg:grid-cols-3 mb-4">
                        <div>
                            <div className='flex justify-center mb-2'>
                                <p className='text-[#502779] font-semibold'>Cantidad</p>
                            </div>
                            <input
                                ref={inputRefs.cantidad}
                                type="number"
                                placeholder="Cantidad"
                                className="w-full px-4 py-2 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-300"
                                value={productoActual.cantidad}
                                onChange={(e) => setProductoActual({ ...productoActual, cantidad: e.target.value })}
                                onKeyDown={(e) => e.key === "Enter" && inputRefs.unidad.current?.focus()}
                                autoFocus
                            />
                        </div>
                        <div>
                            <div className='flex justify-center mb-2'>
                                <p className='text-[#502779] font-semibold'>Unidad</p>
                            </div>
                            <input
                                ref={inputRefs.unidad}
                                type="text"
                                placeholder="Unidad"
                                className="w-full px-4 py-2 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-300"
                                value={productoActual.unidad}
                                onChange={(e) => setProductoActual({ ...productoActual, unidad: e.target.value.toLowerCase() })}
                                onKeyDown={(e) => e.key === "Enter" && inputRefs.nombre.current?.focus()}
                            />
                        </div>
                        <div>
                            <div className='flex justify-center mb-2'>
                                <p className='text-[#502779] font-semibold'>Nombre</p>
                            </div>
                            <div className="relative">
                                <input
                                    ref={inputRefs.nombre}
                                    type="text"
                                    placeholder="Nombre del producto"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-300"
                                    value={productoActual.nombre}
                                    onChange={(e) => {
                                        const value = e.target.value;
                                        setProductoActual({ ...productoActual, nombre: value });
                                        if (value.trim().length > 0) {
                                            const normalizar = (texto: string = "") =>
                                                texto.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

                                            const termino = normalizar(value);

                                            const filtrados = (productos ?? []).filter(p =>
                                                normalizar(p.nombre_producto).includes(termino)
                                            );
                                            setAutocompleteProductos(filtrados);
                                            setShowAutocomplete(filtrados.length > 0);
                                            setAutocompleteIndex(filtrados.length > 0 ? 0 : -1);
                                        } else {
                                            setShowAutocomplete(false);
                                            setAutocompleteIndex(-1);
                                        }
                                    }}
                                    onFocus={() => {
                                        if (productoActual.nombre.trim().length > 0 && autocompleteProductos.length > 0) {
                                            setShowAutocomplete(true);
                                        }
                                    }}
                                    onBlur={() => {
                                        setTimeout(() => setShowAutocomplete(false), 120);
                                    }}
                                    onKeyDown={(e) => {
                                        if (showAutocomplete && autocompleteProductos.length > 0) {
                                            if (e.key === "ArrowDown") {
                                                e.preventDefault();
                                                setAutocompleteIndex(prev => prev < autocompleteProductos.length - 1 ? prev + 1 : 0);
                                            } else if (e.key === "ArrowUp") {
                                                e.preventDefault();
                                                setAutocompleteIndex(prev => prev > 0 ? prev - 1 : autocompleteProductos.length - 1);
                                            } else if (e.key === "Enter") {
                                                e.preventDefault();
                                                if (autocompleteIndex >= 0 && autocompleteIndex < autocompleteProductos.length) {
                                                    const producto = autocompleteProductos[autocompleteIndex];
                                                    setProductoActual({
                                                        ...productoActual,
                                                        nombre: producto.nombre_producto,
                                                        unidad: producto.unidad,
                                                    });
                                                    setShowAutocomplete(false);
                                                } else {
                                                    setShowAutocomplete(false);
                                                    if (indiceEditando !== null) {
                                                        const nombreNuevo = productoActual.nombre.trim().toLowerCase();
                                                        const nombreYaExiste = productosAgregados.some((prod, idx) =>
                                                            idx !== indiceEditando &&
                                                            prod.nombre.trim().toLowerCase() === nombreNuevo
                                                        );
                                                        if (nombreYaExiste) {
                                                            mostrarAviso("El nombre del producto que ingresaste ya está en la lista de productos", "error");
                                                        } else {
                                                            const nuevos = [...productosAgregados];
                                                            nuevos[indiceEditando] = productoActual;
                                                            setProductosAgregados(nuevos);
                                                            setIndiceEditando(null);
                                                            setProductoActual({ cantidad: "", unidad: "", nombre: "" });
                                                        }
                                                    }
                                                    else {
                                                        agregarProducto();
                                                    }
                                                }
                                            }
                                        } else if (e.key === "Enter") {
                                            setShowAutocomplete(false);
                                            if (indiceEditando !== null) {
                                                const nombreNuevo = productoActual.nombre.trim().toLowerCase();
                                                const nombreYaExiste = productosAgregados.some((prod, idx) =>
                                                    idx !== indiceEditando &&
                                                    prod.nombre.trim().toLowerCase() === nombreNuevo
                                                );
                                                if (nombreYaExiste) {
                                                    mostrarAviso("El nombre del producto que ingresaste ya está en la lista de productos", "error");
                                                } else if (
                                                    !(!productoActual.cantidad ||
                                                        !productoActual.unidad ||
                                                        !productoActual.nombre ||
                                                        productoActual.cantidad.includes("-"))
                                                ) {
                                                    const nuevos = [...productosAgregados];
                                                    nuevos[indiceEditando] = productoActual;
                                                    setProductosAgregados(nuevos);
                                                    setIndiceEditando(null);
                                                    setProductoActual({ cantidad: "", unidad: "", nombre: "" });
                                                } else {
                                                    mostrarAviso("Revisa todos los campos antes de modificar, hay datos inválidos", "aviso");
                                                }
                                            }
                                            else {
                                                agregarProducto();
                                            }
                                        }
                                    }}
                                />
                                {showAutocomplete && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -10 }}
                                        className="absolute z-10 w-full bg-white border border-gray-300 rounded-xl shadow-lg max-h-48 overflow-y-auto">
                                        {autocompleteProductos.map((producto, idx) => (
                                            <div
                                                key={producto.id_producto || idx}
                                                ref={el => { autocompleteRefs.current[idx] = el; }}
                                                className={`px-4 py-2 cursor-pointer text-black ${autocompleteIndex === idx ? 'bg-purple-200 font-bold' : 'hover:bg-purple-100'}`}
                                                onMouseDown={() => {
                                                    setProductoActual({
                                                        ...productoActual,
                                                        nombre: producto.nombre_producto,
                                                        unidad: producto.unidad,
                                                    });
                                                    setShowAutocomplete(false);
                                                }}
                                            >
                                                {producto.nombre_producto} ({producto.unidad})
                                            </div>
                                        ))}
                                    </motion.div>
                                )}
                            </div>
                        </div>
                    </div>

                    <button
                        className="w-full lg:hidden bg-[#502779] text-white px-6 py-2 mb-4 rounded-lg hover:bg-[#3d1e5a] transition cursor-pointer"
                        onClick={() => {
                            if (indiceEditando !== null) {
                                const nombreNuevo = productoActual.nombre.trim().toLowerCase();

                                const nombreYaExiste = productosAgregados.some((prod, idx) =>
                                    idx !== indiceEditando &&
                                    prod.nombre.trim().toLowerCase() === nombreNuevo
                                );

                                if (nombreYaExiste) {
                                    mostrarAviso("El nombre del producto que ingresaste ya está en la lista de productos", "error");
                                } else {
                                    const nuevos = [...productosAgregados];
                                    nuevos[indiceEditando] = productoActual;
                                    setProductosAgregados(nuevos);
                                    setIndiceEditando(null);
                                    setProductoActual({ cantidad: "", unidad: "", nombre: "" });
                                }
                            }
                            else {
                                agregarProducto();
                            }
                        }}
                    >
                        Agregar producto
                    </button>
                    {indiceEditando !== null && (
                        <button
                            className="w-full lg:hidden bg-red-200 text-black px-6 py-2 mb-4 rounded-lg hover:bg-red-300 transition cursor-pointer"
                            onClick={() => {
                                setIndiceEditando(null);
                                setProductoActual({ cantidad: "", unidad: "", nombre: "" });
                            }}
                        >
                            Cancelar edición
                        </button>
                    )}

                    {categoria?.id_categoria === 3 && (
                        <div>
                            <div className='flex justify-center mb-2'>
                                <p className='text-[#502779] font-semibold'>Departamento</p>
                            </div>
                            <select
                                name="id_departamento"
                                value={departamento}
                                onChange={(event) => setDepartamento(parseInt((event.target as HTMLSelectElement).value))}
                                className="mb-4 w-full px-4 py-2 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-300"
                            >
                                <option value="0">Seleccionar departamento dónde se resguardará</option>
                                {opcionesDepartamentos.map(dep => (
                                    <option key={dep.id_departamento} value={dep.id_departamento}>
                                        {dep.nombre_departamento}
                                    </option>
                                ))}
                            </select>
                        </div>
                    )}

                    {categoria?.id_categoria === 2 && (
                        <div>
                            <div className='flex justify-center mb-2'>
                                <p className='text-[#502779] font-semibold'>Donador</p>
                            </div>
                            <input
                                name="nombreDonador"
                                placeholder='Donador'
                                value={nombreDonador}
                                onChange={(event) => setNombreDonador(event.target.value.toString())}
                                className="mb-4 w-full px-4 py-2 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-300"
                            >
                            </input>
                        </div>
                    )}

                    {productosAgregados.length >= 0 && (
                        <div className="mb-4">
                            <p className="text-lg font-bold text-center text-black mb-2">
                                Productos agregados ({productosAgregados.length}):
                            </p>

                            <div className="hidden sm:flex justify-between items-center text-[#502779] mb-2">
                                <label className="w-1/6 text-center text-sm font-medium">Partida</label>
                                <label className="w-1/3 text-center text-sm font-medium">Cantidad</label>
                                <label className="w-1/3 text-center text-sm font-medium">Unidad</label>
                                <label className="w-3/2 text-center text-sm font-medium">Concepto</label>
                            </div>

                            <div
                                className={`space-y-2 overflow-y-auto rounded-xl ${categoria?.id_categoria === 3 ? "lg:max-h-[470px]" : "lg:max-h-[620px]"
                                    } max-h-[400px]`}
                            >
                                {(productosAgregados.length !== 0 ? (
                                    productosAgregados.map((prod, idx) => (
                                        <div
                                            key={prod.id}
                                            onClick={() => empezarEdicion(idx)}
                                            className={`flex items-center justify-between border font-semibold rounded-2xl p-2 shadow transition relative text-[#502779] ${indiceEditando === idx
                                                ? "border-yellow-400 bg-yellow-100"
                                                : "border-purple-200 bg-purple-50 cursor-pointer hover:shadow-md"
                                                }`}
                                        >
                                            <div className='w-1/6 bg-purple-100 rounded-full text-center text-base'>
                                                <span className="">{idx + 1}</span>
                                            </div>

                                            <span className="w-1/3 text-center text-base">{prod.cantidad}</span>

                                            <span className="w-1/3 text-center text-base">{prod.unidad}</span>

                                            <span
                                                className="w-3/2 text-center text-base truncate whitespace-normal overflow-visible text-clip"
                                            >
                                                {prod.nombre}
                                            </span>

                                            {indiceEditando === idx && (
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setProductosAgregados((prev) =>
                                                            prev.filter((_, i) => i !== idx)
                                                        );
                                                        setProductoActual({ cantidad: "", unidad: "", nombre: "" });
                                                        setIndiceEditando(null);
                                                    }}
                                                    className="absolute right-2 top-2 bg-red-500 text-white px-2 py-1 text-xs rounded-full shadow hover:bg-red-600 cursor-pointer transition-colors ease-in-out duration-200"
                                                >
                                                    X
                                                </button>
                                            )}
                                        </div>
                                    ))
                                ) : (
                                    <div className='flex justify-center items-center'>
                                        <span className='text-center py-8 text-gray-400 font-semibold'>
                                            No hay ningún producto, ¡Comienza a agregar!
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    <div className="flex flex-col sm:flex-row justify-center items-center gap-4 mt-6">
                        <button
                            onClick={() => {
                                if (indiceEditando === null) {
                                    if (productosAgregados.length > 0) {
                                        if (categoria?.id_categoria === 3 && departamento === 0)
                                            mostrarAviso("Debes seleccionar un departamento para resguardar", "aviso");
                                        else if (categoria?.id_categoria === 2 && nombreDonador === "")
                                            mostrarAviso("Debes agregar el nombre de un donador", "aviso")
                                        else setConfirmarEntradaVisible(true);
                                    } else {
                                        mostrarAviso("Debe agregar al menos un producto", "aviso");
                                    }
                                } else {
                                    mostrarAviso("Debes de terminar de editar el producto para poder terminar y guardar la entrada", "aviso")
                                }
                            }}
                            className={`w-full sm:w-auto ${indiceEditando === null ? "bg-[#502779] hover:bg-[#3d1e5a] cursor-pointer" : "bg-gray-300 cursor-not-allowed"} text-white px-6 py-2 rounded-lg transition`}
                        >
                            Terminar y guardar
                        </button>
                        <button
                            onClick={() => {
                                if (productosAgregados.length > 0) {
                                    setConfirmarSalidaVisible(true)
                                } else {
                                    navigate('/entradas');
                                }
                            }}
                            className="w-full sm:w-auto bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition cursor-pointer"
                        >
                            Volver
                        </button>

                    </div>
                </div>

                <AnimatePresence>
                    {loading && (
                        <Loading mensaje='Guardando...' />
                    )}
                </AnimatePresence>

                {error && (
                    <ErrorCarga />
                )}
            </div>

            <AnimatePresence>
                {confirmarSalidaVisible && (
                    <motion.div
                        className="modal-background fixed z-50 inset-0 bg-black/40 flex justify-center items-center"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        onMouseDown={(e: React.MouseEvent<HTMLDivElement>) => {
                            if ((e.target as HTMLElement).classList.contains("modal-background")) {
                                setConfirmarSalidaVisible(false)
                            }
                        }}
                    >
                        <motion.div
                            className="bg-white p-6 rounded-2xl w-[380px] shadow-2xl border border-gray-200"
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            transition={{ duration: 0.3 }}
                        >
                            <div className="flex justify-center mb-4">
                                <div className="bg-red-100 p-3 rounded-full">
                                    <TriangleAlert className="text-red-600 w-6 h-6" />
                                </div>
                            </div>
                            <p className="text-center text-gray-800 text-lg mb-2">¿Deseas volver?</p>
                            <p className="text-center text-gray-600 text-sm mb-5">Los productos que agregaste se borrarán</p>
                            <div className="flex justify-center gap-4">
                                <button
                                    onClick={() => { navigate('/entradas'); }}
                                    className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 shadow-sm transition cursor-pointer"
                                    autoFocus
                                >
                                    Confirmar
                                </button>
                                <button
                                    onClick={() => setConfirmarSalidaVisible(false)}
                                    className="bg-gray-200 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-300 shadow-sm transition cursor-pointer"
                                >
                                    Cancelar
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            <AnimatePresence>
                {confirmarEntradaVisible && (
                    <motion.div
                        className="modal-background fixed z-50 inset-0 bg-black/40 flex justify-center items-center"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        onMouseDown={(e: React.MouseEvent<HTMLDivElement>) => {
                            if ((e.target as HTMLElement).classList.contains("modal-background")) {
                                setConfirmarEntradaVisible(false)
                            }
                        }}
                    >
                        <motion.div
                            className="bg-white p-6 rounded-2xl w-[380px] shadow-2xl border border-gray-200"
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            transition={{ duration: 0.3 }}
                        >
                            <div className="flex justify-center mb-4">
                                <div className="bg-purple-200 p-3 rounded-full">
                                    <Plus className="text-[#502779] w-6 h-6" />
                                </div>
                            </div>
                            <p className="text-center text-gray-800 text-lg mb-2">¿Deseas agregar todos estos productos?</p>
                            <p className="text-center text-gray-600 text-sm mb-5">Al confirmar el registro podrás imprimir el formato de entrada de {categoria?.nombre_categoria.toLowerCase()} o verlo en el historial de entradas</p>
                            <div className="flex justify-center gap-4">
                                <button
                                    onClick={async () => {
                                        if (productosAgregados.length === 0) {
                                            mostrarAviso("Debes agregar al menos un producto", "aviso");
                                            return;
                                        }

                                        setLoading(true)
                                        setConfirmarEntradaVisible(false)

                                        try {
                                            if (!categoria) {
                                                mostrarAviso("Debes seleccionar una categoría", "error")
                                                return
                                            }

                                            const datos = { categoria, productos: productosAgregados, nombreDonador };

                                            if (categoria.id_categoria !== 3) {
                                                const respuesta = await agregarEntrada(datos)

                                                if (respuesta.ok) {
                                                    const urlPDF = `/archivos_entradas/${respuesta.nombre_pdf}`
                                                    sessionStorage.setItem("URL_PDF", urlPDF)
                                                    sessionStorage.setItem("mensaje_exito", respuesta.message || "Entrada agregada");
                                                    navigate('/entradas');
                                                } else {
                                                    mostrarAviso(respuesta.message || "Error", "error");
                                                }
                                            } else {
                                                const datos = { categoria, productos: productosAgregados, departamento }

                                                const respuesta = await agregarResguardo(datos)

                                                if (respuesta.ok) {
                                                    const urlPDF = `/archivos_resguardos/${respuesta.nombre_pdf}`
                                                    sessionStorage.setItem("URL_PDF", urlPDF)
                                                    sessionStorage.setItem("mensaje_exito", respuesta.message || "Entrada agregada");
                                                    navigate('/resguardos');
                                                } else {
                                                    mostrarAviso(respuesta.message || "Error", "error");
                                                }

                                            }
                                        } catch (error) {
                                            console.error(error)
                                            mostrarAviso("Error", "error");
                                        } finally {
                                            setLoading(false)
                                        }
                                    }}
                                    className="flex items-center gap-2 bg-[#502779] text-white px-4 py-2 rounded-md hover:bg-[#3d1e5a] transition duration-200 cursor-pointer"
                                    disabled={loading}
                                    autoFocus
                                >
                                    Confirmar
                                </button>
                                <button
                                    onClick={() => setConfirmarEntradaVisible(false)}
                                    className="bg-gray-200 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-300 shadow-sm transition cursor-pointer"
                                >
                                    Cancelar
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            <AvisoToastStack avisos={avisos} onClose={cerrarAviso} />
        </>
    );
}

export default AgregarEntrada;
