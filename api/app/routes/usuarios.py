from fastapi import APIRouter, HTTPException, status, Depends
from app.core.database import fetch_all_dict, get_connection
from app.models.modelo_usuario import CredencialesUsuario, DataAgregarUsuario, DatosActualizarUsuario
from app.auth.jwt_handler import crear_token
from app.auth.dependencies import verify_token

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

@router.get("/obtener_usuarios", status_code=status.HTTP_200_OK)
def obtener_usuarios(usuario=Depends(verify_token)):
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
def agregar_usuario(data_usuario: DataAgregarUsuario, usuario=Depends(verify_token)):
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
def actualizar_usuario(datos_usuario: DatosActualizarUsuario, usuario=Depends(verify_token)):
    try:
        connection = get_connection()
        cursor = connection.cursor()
        
        cursor.execute("""
            SELECT id_usuario FROM usuarios 
            WHERE correo_usuario = ? AND id_usuario != ?
        """, (datos_usuario.correo_usuario, datos_usuario.id_usuario))
        usuario_existente = cursor.fetchone()

        if usuario_existente:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail={"error": "El correo ya está registrado por otro usuario."}
            )

        if not datos_usuario.new_password:
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
                detail={"error": "No se ha podido editar el cliente, intente más tarde"}
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