from pydantic import BaseModel

class DataCrearDepartamento(BaseModel):
    nombre_departamento: str
    
class DataModificarDepartamento(BaseModel):
    id_departamento: int
    nombre_departamento: str
    id_responsable: int

class DataEliminarDepartamento(BaseModel):
    id_departamento: int