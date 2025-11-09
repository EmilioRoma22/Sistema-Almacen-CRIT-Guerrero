from fastapi import APIRouter, HTTPException, status
from app.core.database import fetch_all_dict, get_connection
from app.models.modelo_usuario import CredencialesUsuario
from app.auth.jwt_handler import crear_token
import os

router = APIRouter(
    prefix="/usuarios",
    tags=["Usuarios"]
)

@router.post("/iniciar_sesion", status_code=status.HTTP_200_OK)
def login(credenciales_usuario: CredencialesUsuario):
    try:
        connection = get_connection()
        cursor = connection.cursor()
        
        cursor.execute("SELECT * FROM usuarios WHERE correo_usuario = ?", (credenciales_usuario.correo_usuario,))
        usuario = fetch_all_dict(cursor)
        
        if not usuario:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail={"error": "Correo o contraseña incorrectos"}
            )
        
        if usuario[0]['contraseña_usuario'] != credenciales_usuario.password_usuario:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail={"error": "Correo o contraseña incorrectos"}
            )
        
        cursor.execute("SELECT * FROM responsables_departamento WHERE id_usuario = ?", (usuario[0]["id_usuario"],))
        responsables = fetch_all_dict(cursor)
        es_responsable = bool(responsables)
        
        if not es_responsable:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail={"error": "Solo los responsables del departamento pueden accesar"}
            )
        
        cursor.execute("SELECT nombre_departamento FROM departamentos WHERE id_departamento = ?", (usuario[0]['id_departamento'],))
        nombre_departamento = fetch_all_dict(cursor)

        token = crear_token(usuario[0], nombre_departamento[0]["nombre_departamento"])
        
        return {
            "message": "Inicio de sesión exitoso",
            "token": token
        }

    except HTTPException as err:
        raise err

    except Exception as err:
        print(f"Error interno: {err}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail={"error": "Error interno del servidor"}
        )

    finally:
        if 'cursor' in locals():
            cursor.close()
        if 'connection' in locals():
            connection.close()
