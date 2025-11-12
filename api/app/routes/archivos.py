from fastapi import APIRouter, HTTPException
from fastapi.responses import FileResponse
import os

router = APIRouter()

ARCHIVOS_ENTRADAS_DIR = os.path.join(os.path.dirname(__file__), "../archivos_entradas")

@router.get("/archivos_entradas/{filename}")
async def obtener_pdf(filename: str):
    ruta_pdf = os.path.join(ARCHIVOS_ENTRADAS_DIR, filename)
    print("Buscando archivo en:", ruta_pdf)
    if not os.path.exists(ruta_pdf):
        raise HTTPException(status_code=404, detail="Archivo no encontrado")
    return FileResponse(
        ruta_pdf,
        media_type="application/pdf",
        headers={"Content-Disposition": "inline"}
    )
