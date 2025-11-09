from pydantic import BaseModel

class CredencialesUsuario(BaseModel):
    correo_usuario: str
    password_usuario: str

class DataAgregarUsuario(BaseModel):
    nombre_usuario: str
    apellidos_usuario: str
    correo_usuario: str
    id_departamento: int
    contraseña_usuario: str
    confirmar_contraseña: str

class DatosActualizarUsuario(BaseModel):
    nombre_usuario: str
    apellidos_usuario: str
    correo_usuario: str
    id_usuario: int
    new_password: str
    id_departamento: int
    id_usuario: int