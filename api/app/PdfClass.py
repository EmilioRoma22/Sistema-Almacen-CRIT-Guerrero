from fpdf import FPDF
from datetime import datetime
import os
import tempfile
import shutil

class PDF(FPDF):
    def __init__(
        self, 
        titulo, 
        id_categoria=0,
        num_operacion=0,
        nombre_donador='', 
        nombre_departamento='', 
        nombre_responsable_almacen='', 
        nombre_responsable_departamento='', 
        nombre_departamento_actual='', 
        nombre_departamento_destino ='',
        nombre_responsable_departamento_actual='',
        nombre_responsable_departamento_destino='',
        entrega=False, requisicion=False, movimiento=False
    ):
        super().__init__()
        self.titulo = titulo
        self.id_categoria = id_categoria
        self.nombre_donador = nombre_donador
        self.nombre_responsable_almacen = nombre_responsable_almacen
        self.nombre_departamento = nombre_departamento
        self.nombre_responsable_departamento = nombre_responsable_departamento
        self.nombre_departamento_actual = nombre_departamento_actual
        self.nombre_departamento_destino = nombre_departamento_destino
        self.nombre_responsable_departamento_destino = nombre_responsable_departamento_destino
        self.nombre_responsable_departamento_actual = nombre_responsable_departamento_actual
        self.entrega = entrega
        self.requisicion = requisicion
        self.movimiento = movimiento
        self.num_operacion = num_operacion

        self.set_auto_page_break(auto=True, margin=40)
        self.line_height = 5.5
        self.col_widths = [15, 17, 150]
        self.pages_with_firma = {}
        self.font_regular = "Arial"

        self.fecha_actual = datetime.now().strftime("%d/%m/%Y %H:%M")
        
        self.logo_temp_path = None
        BASE_DIR = os.path.dirname(os.path.abspath(__file__))
        logo_path = os.path.join(BASE_DIR, "static", "img", "teleton_logo.png")

        if os.path.exists(logo_path):
            with tempfile.NamedTemporaryFile(delete=False, suffix=".png") as tmp:
                shutil.copyfile(logo_path, tmp.name)
                self.logo_temp_path = tmp.name
            
    def header(self):
        if self.page_no() == 1 and self.logo_temp_path:
            self.image(self.logo_temp_path, x=10, y=8, w=30, h=30)

            self.set_font("Times", "B", 19)
            self.cell(0, 10, self.titulo, ln=True, align="R")
            
            if self.id_categoria == 2 and self.nombre_donador:
                self.set_font("Times", "", 14)
                self.cell(0, 10, f"Productos donados por {self.nombre_donador}", ln=True, align="R")
            if self.id_categoria == 3 and self.nombre_departamento:
                self.set_font("Times", "", 14)
                self.cell(0, 10, f"Resguardo en {self.nombre_departamento}", ln=True, align="R")
            if self.entrega:
                self.set_font("Times", "", 14)
                self.cell(0, 10, f"Entrega a {self.nombre_departamento}", ln=True, align="R")
            if self.requisicion:
                self.set_font("Times", "", 14)
                self.cell(0, 10, f"Salida a {self.nombre_departamento}", ln=True, align="R")
            if self.movimiento:
                self.set_font("Times", "", 14)
                self.cell(0, 10, f"Producto movido de {self.nombre_departamento_actual} a {self.nombre_departamento_destino}", ln=True, align="R")
            self.set_font("Times", "", 12)
            self.cell(0, 10, self.fecha_actual, ln=True, align="R")
            if self.nombre_donador or self.nombre_departamento: self.ln(5)
            else: self.ln(12)
            self.set_line_width(0.3)
            self.line(10, self.get_y(), 200, self.get_y())
                        
            if self.num_operacion:
                self.set_font("Times", "B", 9)
                self.cell(0, 8, f"Número de operación: {self.num_operacion}", ln=True, align="L")
                            
            self.set_font("Times", "B", 9)
            self.cell(self.col_widths[0], 8, "Cantidad", border=0)
            self.cell(self.col_widths[1], 8, "Unidad", border=0)
            self.cell(self.col_widths[2], 8, "Concepto", border=0)
            self.ln()

    def footer(self):
        page = self.page_no()
        if self.pages_with_firma.get(page, False):
            if not self.entrega and not self.requisicion and not self.movimiento:
                self.set_y(-45)
                self.line(55, self.get_y(), 155, self.get_y())
                self.set_font(self.font_regular)
                self.ln(3)
                self.cell(0, 7, "RESPONSABLE DE ALMACÉN", ln=True, align="C")
                self.cell(0, 5, self.nombre_responsable_almacen.upper(), ln=True, align="C")
            else:
                self.set_y(-50)

                y_line = self.get_y()
                x_izq_start, x_izq_end = 5, 65
                x_cen_start, x_cen_end = 80, 130
                x_der_start, x_der_end = 150, 200

                self.line(x_izq_start, y_line, x_izq_end, y_line)    
                self.line(x_cen_start, y_line, x_cen_end, y_line)
                self.line(x_der_start, y_line, x_der_end, y_line)

                self.set_y(y_line + 3)
                self.set_font(self.font_regular, size=9)

                self.set_x(x_izq_start)
                self.cell(x_izq_end - x_izq_start, 5, "RESPONSABLE DE ALMACÉN", align="C")

                self.set_y(y_line + 8)
                self.set_x(x_izq_start)
                self.cell(x_izq_end - x_izq_start, 5, self.nombre_responsable_almacen.upper(), align="C")

                self.set_y(y_line + 3)
                self.set_x(x_cen_start)
                if not self.movimiento: self.cell(x_cen_end - x_cen_start, 5, f"RESPONSABLE DE {self.nombre_departamento.upper()}", align="C")
                else: self.cell(x_cen_end - x_cen_start, 5, f"RESPONSABLE DE {self.nombre_departamento_actual.upper()}", align="C")

                self.set_y(y_line + 8)
                self.set_x(x_cen_start)
                if not self.movimiento: self.cell(x_cen_end - x_cen_start, 5, self.nombre_responsable_departamento.upper(), align="C")
                else: self.cell(x_cen_end - x_cen_start, 5, self.nombre_responsable_departamento_actual.upper(), align="C")

                self.set_y(y_line + 3)
                self.set_x(x_der_start)
                if self.movimiento: self.cell(x_cen_end - x_cen_start, 5, f"RESPONSABLE DE {self.nombre_departamento_destino.upper()}", align="C")

                self.set_y(y_line + 8)
                self.set_x(x_der_start)
                if self.movimiento: self.cell(x_cen_end - x_cen_start, 5, self.nombre_responsable_departamento_destino.upper(), align="C")
                else: self.cell(x_der_end - x_der_start, 5, "", align="C")

        self.set_y(-32)
        self.set_font("Helvetica", "I", 9)
        self.cell(0, 10, f"Página {page} de {{nb}}", align="R")

    def add_productos(self, productos):
        def sanitize_latin1(text):
            if not isinstance(text, str):
                return ""
            text = text.replace("“", '"').replace("”", '"').replace("‘", "'").replace("’", "'")
            return text.encode("latin-1", "ignore").decode("latin-1")

        self.set_font(self.font_regular)

        for prod in productos:
            cantidad = str(prod.get("cantidad", ""))
            unidad = prod.get("unidad", "")
            nombre = sanitize_latin1(prod.get("nombre_producto", ""))
            lines = self.multi_cell_split(nombre, self.col_widths[2])
            height = self.line_height * len(lines)

            # Calcular líneas necesarias para el nombre
            lines = self.multi_cell_split(nombre, self.col_widths[2 ])
            height = self.line_height * len(lines)
            
            if self.get_y() + height > self.h - self.b_margin:
                self.add_page()
                #Reimprimir el encabezado de las columnas
                self.set_font("Times", "B", 9)
                self.cell(self.col_widths[0], 8, "Cantidad", border=0)
                self.cell(self.col_widths[1], 8, "Unidad", border=0)
                self.cell(self.col_widths[2], 8, "Concepto", border=0)
                self.ln()
                self.set_font(self.font_regular)
            
            # POSICIÓN INICIAL
            x = self.get_x()
            y = self.get_y()

            # Celda: cantidad
            self.set_xy(x, y)
            self.cell(self.col_widths[0], self.line_height, cantidad, border=0)
            
            # Celda: unidad
            self.set_xy(x + self.col_widths[0], y)
            self.cell(self.col_widths[1], self.line_height, unidad, border=0)

            # Celda: Nombre línea por línea.
            concepto_x = x + self.col_widths[0] + self.col_widths[1]
            for i, line in enumerate(lines):
                self.set_xy(concepto_x, y + i * self.line_height)
                self.cell(self.col_widths[2], self.line_height, line, border=0)

            self.set_y(y + height)

    def multi_cell_split(self, text, max_width):
        words = text.split()
        lines = []
        current_line = ""

        for word in words:
            test_line = f"{current_line} {word}".strip()
            if self.get_string_width(test_line) < max_width:
                current_line = test_line
            else:
                lines.append(current_line)
                current_line = word

        if current_line:
            lines.append(current_line)
        return lines
