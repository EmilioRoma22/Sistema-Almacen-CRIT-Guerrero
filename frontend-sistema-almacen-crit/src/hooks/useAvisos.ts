import { useEffect, useRef, useState } from "react";

type Aviso = {
  id: number;
  mensaje: string;
  tipo: "error" | "success" | "aviso";
};

export function useAvisos() {
  const [avisos, setAvisos] = useState<Aviso[]>([]);
  const timeouts = useRef<ReturnType<typeof setTimeout>[]>([]);

  const mostrarAviso = (mensaje: string, tipo: "success" | "error" | "aviso") => {
    const nuevoAviso: Aviso = {
      id: Date.now(),
      mensaje,
      tipo,
    };

    setAvisos((prev) => [...prev, nuevoAviso]);

    const timeoutId = setTimeout(() => {
      setAvisos((prev) => prev.filter((aviso) => aviso.id !== nuevoAviso.id));
      timeouts.current = timeouts.current.filter(id => id !== timeoutId);
    }, 5000);

    timeouts.current.push(timeoutId);
  };

  const cerrarAviso = (id: number) => {
    setAvisos((prev) => prev.filter((aviso) => aviso.id !== id));
  };

  useEffect(() => {
    return () => {
      timeouts.current.forEach(clearTimeout);
      timeouts.current = [];
    };
  }, []);

  return { avisos, mostrarAviso, cerrarAviso };
}
