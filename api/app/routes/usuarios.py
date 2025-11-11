from fastapi import APIRouter, HTTPException, Request, Response, status, Depends
from fastapi.responses import JSONResponse
from app.core.database import fetch_all_dict, get_connection
from app.models.modelo_usuario import CredencialesUsuario, DataAgregarUsuario, DatosActualizarUsuario
from app.auth.jwt_handler import crear_token, decodificar_token
from app.auth.dependencies import verify_access
from datetime import datetime, timedelta, timezone
import jwt
import os

router = APIRouter(
    prefix="/usuarios",
    tags=["Usuarios"]
)

SECRET_KEY = os.getenv("SECRET_KEY")
ALGORITHM = "HS256"

@router.get("/me")
def obtener_usuario_actual(request: Request):
    try:
        access_token = request.cookies.get("access_token")
        if not access_token:
            raise HTTPException(status_code=401, detail="No autenticado")

        try:
            payload = jwt.decode(access_token, SECRET_KEY, algorithms=[ALGORITHM])
        except jwt.ExpiredSignatureError:
            raise HTTPException(status_code=401, detail="Token expirado")
        except jwt.PyJWTError:
            raise HTTPException(status_code=401, detail="Token inválido")

        usuario_info = {
            "id_usuario": payload["id_usuario"],
            "id_departamento": payload["id_departamento"],
            "nombre_departamento": payload["nombre_departamento"],
            "nombre_usuario": payload["nombre_usuario"],
            "apellidos_usuario": payload["apellidos_usuario"],
            "correo_usuario": payload["correo_usuario"],
        }

        return {"usuario": usuario_info}

    except HTTPException as err:
        raise err
    except Exception as err:
        print("Error en /me:", err)
        raise HTTPException(status_code=500, detail="Error interno del servidor")

@router.post("/iniciar_sesion", status_code=status.HTTP_200_OK)
def login(credenciales_usuario: CredencialesUsuario, response: Response):
    try:
        connection = get_connection()
        cursor = connection.cursor()

        cursor.execute("SELECT * FROM usuarios WHERE correo_usuario = ?", (credenciales_usuario.correo_usuario,))
        usuario = fetch_all_dict(cursor)

        if not usuario or usuario[0]['contraseña_usuario'] != credenciales_usuario.password_usuario:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail={"error": "Correo o contraseña incorrectos"}
            )

        cursor.execute("SELECT * FROM responsables_departamento WHERE id_usuario = ?", (usuario[0]["id_usuario"],))
        responsables = fetch_all_dict(cursor)
        if not responsables:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail={"error": "Solo los responsables del departamento pueden accesar"}
            )

        cursor.execute("SELECT nombre_departamento FROM departamentos WHERE id_departamento = ?", (usuario[0]['id_departamento'],))
        nombre_departamento = fetch_all_dict(cursor)[0]["nombre_departamento"]

        token = crear_token(usuario[0], nombre_departamento)

        response = JSONResponse(
            content={
                "message": "Inicio de sesión exitoso",
                "usuario": {
                    "id_usuario": usuario[0]["id_usuario"],
                    "nombre_usuario": usuario[0]["nombre_usuario"],
                    "apellidos_usuario": usuario[0]["apellidos_usuario"],
                    "correo_usuario": usuario[0]["correo_usuario"],
                    "id_departamento": usuario[0]["id_departamento"],
                    "nombre_departamento": nombre_departamento
                }
            }
        )

        response.set_cookie(
            key="access_token",
            value=token,
            httponly=True,
            secure=False,
            samesite="lax",
            max_age=60 * 60 * 24,
            path="/"
        )

        return response
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

@router.post("/cerrar_sesion")
def cerrar_sesion():
    response = JSONResponse(content={"message": "Sesión cerrada correctamente"})

    response.delete_cookie("access_token", path="/")
    response.delete_cookie("refresh_token", path="/")

    return response

@router.post("/refresh")
def refresh_token(request: Request):
    try:
        refresh_token = request.cookies.get("refresh_token")
        if not refresh_token:
            raise HTTPException(status_code=401, detail="No hay token de actualización")
        try:
            payload = jwt.decode(refresh_token, SECRET_KEY, algorithms=[ALGORITHM])
        except jwt.ExpiredSignatureError:
            raise HTTPException(status_code=401, detail="El token de actualización ha expirado")
        except jwt.PyJWTError:
            raise HTTPException(status_code=401, detail="Token inválido")

        nuevo_access_token = jwt.encode(
            {
                "id_usuario": payload["id_usuario"],
                "id_departamento": payload["id_departamento"],
                "nombre_departamento": payload["nombre_departamento"],
                "nombre_usuario": payload["nombre_usuario"],
                "apellidos_usuario": payload["apellidos_usuario"],
                "correo_usuario": payload["correo_usuario"],
                "exp": datetime.now(timezone.utc) + timedelta(minutes=15)
            },
            SECRET_KEY,
            algorithm=ALGORITHM
        )

        response = JSONResponse(content={"message": "Token actualizado correctamente"})
        response.set_cookie(
            key="access_token",
            value=nuevo_access_token,
            httponly=True,
            secure=False,
            samesite="lax",
            max_age=60 * 15,
            path="/"
        )
        return response

    except HTTPException as err:
        raise err

    except Exception as err:
        print(f"Error en refresh: {err}")
        raise HTTPException(status_code=500, detail="Error interno del servidor")

@router.get("/obtener_usuarios", status_code=status.HTTP_200_OK)
def obtener_usuarios(usuario=Depends(verify_access([1]))):
    try:
        connection = get_connection()
        cursor = connection.cursor()
        
        if usuario["id_departamento"] != 1:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail={"error": "No tienes permitido hacer esta accion"}
            )
        
        cursor.execute("""
            SELECT 
                u.id_usuario,
                u.nombre_usuario,
                u.apellidos_usuario,
                u.correo_usuario,
                u.id_departamento,
                d.nombre_departamento
            FROM usuarios u
            LEFT JOIN departamentos d ON u.id_departamento = d.id_departamento
            WHERE u.activo = 1
            ORDER BY u.id_departamento ASC;
        """)
        
        usuarios = fetch_all_dict(cursor)
        
        return usuarios
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

@router.post("/agregar_usuario", status_code=status.HTTP_200_OK)
def agregar_usuario(data_usuario: DataAgregarUsuario, usuario=Depends(verify_access([1]))):
    try:
        connection = get_connection()
        cursor = connection.cursor()
        
        cursor.execute("SELECT correo_usuario FROM usuarios WHERE correo_usuario = ? AND activo = 1", (data_usuario.correo_usuario,))
        exite_correo = cursor.fetchone()

        if not exite_correo:
            cursor.execute("""
                INSERT INTO usuarios (nombre_usuario, apellidos_usuario, correo_usuario, contraseña_usuario, id_departamento)
                VALUES (?, ?, ?, ?, ?)
            """, (
                data_usuario.nombre_usuario,
                data_usuario.apellidos_usuario,
                data_usuario.correo_usuario,
                data_usuario.contraseña_usuario,
                data_usuario.id_departamento
            ))

            if cursor.rowcount == 0:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail={"error": "No se ha podido crear el usuario, intente más tarde"}
                )
            
            connection.commit()
        
            return {
                "message": f"{data_usuario.nombre_usuario} {data_usuario.apellidos_usuario} ha sido agregado/a exitosamente"
            }
        else:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail={"error": "El correo ya está registrado"}
            )
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

@router.put("/actualizar_usuario", status_code=status.HTTP_200_OK)
def actualizar_usuario(datos_usuario: DatosActualizarUsuario, usuario=Depends(verify_access([1]))):
    try:
        connection = get_connection()
        cursor = connection.cursor()
                
        cursor.execute("""
            SELECT id_usuario FROM usuarios 
            WHERE correo_usuario = ? AND id_usuario != ? AND activo = 1
        """, (datos_usuario.correo_usuario, datos_usuario.id_usuario))
        usuario_existente = cursor.fetchone()

        if usuario_existente:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail={"error": "El correo ya está registrado por otro usuario."}
            )

        if datos_usuario.new_password:
            sql = """
                UPDATE usuarios
                SET nombre_usuario = ?,
                    apellidos_usuario = ?,
                    correo_usuario = ?,
                    id_departamento = ?,
                    contraseña_usuario = ?
                WHERE id_usuario = ?
            """
            valores = (
                datos_usuario.nombre_usuario,
                datos_usuario.apellidos_usuario,
                datos_usuario.correo_usuario,
                datos_usuario.id_departamento,
                datos_usuario.new_password,
                datos_usuario.id_usuario
            )
        else:
            sql = """
                UPDATE usuarios
                SET nombre_usuario = ?,
                    apellidos_usuario = ?,
                    correo_usuario = ?,
                    id_departamento = ?
                WHERE id_usuario = ?
            """
            valores = (
                datos_usuario.nombre_usuario,
                datos_usuario.apellidos_usuario,
                datos_usuario.correo_usuario,
                datos_usuario.id_departamento,
                datos_usuario.id_usuario
            )

        cursor.execute(sql, valores)

        if cursor.rowcount == 0:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail={"error": "No se ha podido modificar el cliente, intente más tarde"}
            )

        connection.commit()
        
        return {
            "message": "El usuario se ha modificado correctamente"
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

@router.delete("/eliminar_usuario", status_code=status.HTTP_200_OK)
def eliminar_usuario(id_usuario: int, usuario=Depends(verify_access([1]))):
    try:
        connection = get_connection()
        cursor = connection.cursor()
        
        print(id_usuario)
        
        cursor.execute("SELECT nombre_usuario, apellidos_usuario FROM usuarios WHERE id_usuario = ?", (id_usuario,))
        resultado = fetch_all_dict(cursor)
        
        if not resultado:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail={"error": "El usuario no existe"}
            )

        cursor.execute("UPDATE usuarios SET activo = 0 WHERE id_usuario = ?", (id_usuario,))

        if cursor.rowcount == 0:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail={"error": "No se ha podido eliminar el usuario"}
            )

        connection.commit()

        return {
            "message": "Usuario eliminado correctamente"
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