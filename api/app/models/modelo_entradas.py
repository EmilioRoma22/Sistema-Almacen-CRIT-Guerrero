from pydantic import BaseModel
from typing import List, Optional

class Categoria(BaseModel):
    id_categoria: int
    nombre_categoria: str

class Producto(BaseModel):
    id: Optional[str]
    cantidad: str
    unidad: str
    nombre: str

class DataAgregarEntrada(BaseModel):
    categoria: Categoria
    productos: List[Producto]
    nombre_donador: Optional[str] = None
