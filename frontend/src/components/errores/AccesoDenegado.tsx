import { motion } from "framer-motion";
import logo_teleton from '../../assets/teleton_logo.svg';

const AccesoDenegado = () => {
    return (
        <>
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                className="flex flex-col items-center"
            >
                <main className="grid min-h-full place-items-center bg-white px-6 py-24 sm:py-32 lg:px-8 mt-1">
                    <div className="text-center">
                        <img src={logo_teleton} alt="Logo" className="w-40 h-40 m-auto mb-5" />
                        <p className="text-base font-semibold text-[#502779]">ERROR</p>
                        <h1 className="mt-4 text-5xl font-semibold tracking-tight text-balance text-gray-900 sm:text-7xl">
                            Permiso denegado
                        </h1>
                        <p className="mt-6 text-lg font-medium text-pretty text-gray-500 sm:text-xl/8">
                            Usted no tiene el permiso para acceder a esta ruta. Se registrará el intento de acceso. Si piensa que se trata de un error contactese con el administrador.
                        </p>
                    </div>
                    <div className="mt-10 flex items-center justify-center gap-x-6">
                        <a
                            href="/"
                            className="rounded-md bg-[#502779] px-3.5 py-2.5 text-sm font-semibold text-white shadow-xs transition-color ease-in-out duration-300 hover:bg-[#58426e] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                        >
                            Regresar al inicio
                        </a>
                    </div>
                    <p className='text-center text-black/60 mt-10'>®INVECRIT Emilandy 2025</p>

                </main>
            </motion.div>

        </>
    );
}

export default AccesoDenegado;