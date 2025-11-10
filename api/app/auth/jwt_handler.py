import os
from datetime import datetime, timedelta, timezone
import jwt
from jwt import PyJWTError
from fastapi import HTTPException, status
from dotenv import load_dotenv

load_dotenv()
SECRET_KEY = os.getenv("SECRET_KEY")
ALGORITHM = "HS256"

def crear_token(usuario: dict, nombre_departamento: str):
    if not SECRET_KEY:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail={"error": "Error del servidor, por favor intente mas tarde."}
        )

    payload = {
        "id_usuario": usuario["id_usuario"],
        "id_departamento": usuario["id_departamento"],
        "nombre_departamento": nombre_departamento,
        "nombre_usuario": usuario['nombre_usuario'],
        "apellidos_usuario": usuario['apellidos_usuario'],
        "correo_usuario": usuario['correo_usuario'],
        "exp": datetime.now(timezone.utc) + timedelta(days=1)
    }

    token = jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)
    return token

def decodificar_token(token: str):
    try:
        return jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
    except PyJWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail={"error": "Token inválido o expirado"}
        )
