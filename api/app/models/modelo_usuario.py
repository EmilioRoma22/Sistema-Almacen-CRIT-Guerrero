from pydantic import BaseModel

class CredencialesUsuario(BaseModel):
    correo_usuario: str
    password_usuario: str