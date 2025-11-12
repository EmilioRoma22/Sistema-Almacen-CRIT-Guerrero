from app.PdfClass import PDF
from datetime import datetime

import os

def generar_pdf_entrada(titulo, productos, id_categoria=0, nombre_donador='', nombre_responsable_almacen='', num_operacion=0):
    pdf = PDF(
        titulo=titulo, 
        id_categoria=id_categoria, 
        nombre_donador=nombre_donador, 
        nombre_responsable_almacen=nombre_responsable_almacen, 
        num_operacion=num_operacion)
    pdf.alias_nb_pages()
    pdf.add_page()
    pdf.add_productos(productos)

    pdf.pages_with_firma[pdf.page_no()] = True

    nombre_archivo = f"entrada_{datetime.now().strftime('%Y%m%d_%H%M%S')}.pdf"
    BASE_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..")
    BASE_DIR = os.path.abspath(BASE_DIR)
    ruta_carpeta = os.path.join(BASE_DIR, "archivos_entradas")
    os.makedirs(ruta_carpeta, exist_ok=True)

    ruta_pdf = os.path.join(ruta_carpeta, nombre_archivo)
    pdf.output(ruta_pdf)
    
    if pdf.logo_temp_path and os.path.exists(pdf.logo_temp_path):
        os.remove(pdf.logo_temp_path)
    
    return nombre_archivo