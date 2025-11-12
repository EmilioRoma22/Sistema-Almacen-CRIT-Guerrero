import apiAxios from "./apiAxios";

export async function imprimirPDF(urlPDF: string) {
    try {
        const response = await apiAxios.get<Blob>(urlPDF, { responseType: "blob" });
        const blob = response.data;

        // Crear URL del blob
        const blobUrl = URL.createObjectURL(blob);

        // Abrir en nueva ventana
        const newWindow = window.open(blobUrl);
        if (!newWindow) return;

        // Esperar a que la ventana cargue y luego imprimir automáticamente
        newWindow.onload = () => {
            newWindow.focus();
            newWindow.print();

            // Opcional: liberar blob después de imprimir
            setTimeout(() => URL.revokeObjectURL(blobUrl), 5000);
        };
    } catch (err) {
        console.error("Error al obtener o imprimir PDF:", err);
    }
}


