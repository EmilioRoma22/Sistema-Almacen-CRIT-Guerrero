from fastapi import APIRouter, status, Depends, HTTPException
from app.models.modelo_departamento import DataCrearDepartamento, DataEliminarDepartamento, DataModificarDepartamento
from app.auth.dependencies import verify_access
from app.core.database import fetch_all_dict, get_connection

router = APIRouter(
    prefix="/departamentos",
    tags=["Departamentos"]
)

@router.get("/obtener_departamentos", status_code=status.HTTP_200_OK)
def obtener_departamentos(usuario=Depends(verify_access([1, 2]))):
    try:
        connection = get_connection()
        cursor = connection.cursor()
        
        cursor.execute("""
            SELECT 
                d.id_departamento,
                d.nombre_departamento,
                rd.id_usuario AS id_responsable,
                r.nombre_usuario,
                r.apellidos_usuario,
                r.correo_usuario,
                COUNT(CASE WHEN u.activo = 1 THEN u.id_usuario END) AS cantidad_usuarios
            FROM 
                departamentos d
            LEFT JOIN responsables_departamento rd 
                ON d.id_departamento = rd.id_departamento
            LEFT JOIN usuarios r 
                ON rd.id_usuario = r.id_usuario
            LEFT JOIN usuarios u 
                ON d.id_departamento = u.id_departamento
            WHERE d.activo = 1
            GROUP BY 
                d.id_departamento, d.nombre_departamento,
                rd.id_usuario, r.nombre_usuario, r.apellidos_usuario, r.correo_usuario
        """)
        
        departamentos = fetch_all_dict(cursor)
        
        return departamentos
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
            
@router.post("/agregar_departamento", status_code=status.HTTP_200_OK)
def agregar_departamento(data_departamento: DataCrearDepartamento, usuario=Depends(verify_access([1]))):
    try:
        connection = get_connection()
        cursor = connection.cursor()
        
        cursor.execute("INSERT INTO departamentos (nombre_departamento) VALUES (?)", (data_departamento.nombre_departamento,))

        if cursor.rowcount == 0:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail={"error": "No se creó el departamento correctamente"}
            )

        connection.commit()
        
        return {
            "message": f"El departamento {data_departamento.nombre_departamento} se ha creado correctamente"
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

@router.put("/modificar_departamento", status_code=status.HTTP_200_OK)
def modificar_departamento(data_departamento: DataModificarDepartamento, usuario=Depends(verify_access([1]))):
    try:
        connection = get_connection()
        cursor = connection.cursor()
        
        if data_departamento.id_responsable == 0:
            data_departamento.id_responsable = None
            
        cursor.execute("SELECT id_usuario FROM responsables_departamento WHERE id_departamento = ?", (data_departamento.id_departamento,))
        row = cursor.fetchone()

        cursor.execute(
            "UPDATE departamentos SET nombre_departamento = ? WHERE id_departamento = ?",
            (data_departamento.nombre_departamento, data_departamento.id_departamento)
        )

        if row:
            if row[0] != data_departamento.id_responsable:
                cursor.execute(
                    "UPDATE responsables_departamento SET id_usuario = ? WHERE id_departamento = ?",
                    (data_departamento.id_responsable, data_departamento.id_departamento)
                )
        else:
            cursor.execute(
                "INSERT INTO responsables_departamento (id_departamento, id_usuario) VALUES (?, ?)",
                (data_departamento.id_departamento, data_departamento.id_responsable)
            )

        if cursor.rowcount == 0:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail={"error": "No se pudo actualizar el departamento"}
            )
        
        connection.commit()

        return {"message": f"El departamento {data_departamento.nombre_departamento} actualizado correctamente"}
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

@router.delete("/eliminar_departamento", status_code=status.HTTP_200_OK)
def eliminar_departamento(id_departamento: DataEliminarDepartamento, usuario=Depends(verify_access([1]))):
    try:
        connection = get_connection()
        cursor = connection.cursor()
        
        print(id_departamento.id_departamento)

        if id_departamento.id_departamento in (1, 2, 3):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail={"error": "No puedes eliminar este departamento"}
            )

        connection = get_connection()
        cursor = connection.cursor()

        cursor.execute("SELECT 1 FROM usuarios WHERE id_departamento = ? AND activo = 1", (id_departamento.id_departamento,))
        usuarios = cursor.fetchall()

        cursor.execute("SELECT nombre_departamento FROM departamentos WHERE id_departamento = ?", (id_departamento.id_departamento,))
        resultado = fetch_all_dict(cursor)
        
        if not resultado:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail={"error": "No se ha encontrado el departamento elegido"}
            )
        
        if usuarios:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail={"error": "No puedes desactivar este departamento porque tiene usuarios activos asociados"}
            )

        cursor.execute("UPDATE departamentos SET activo = 0 WHERE id_departamento = ?", (id_departamento.id_departamento,))

        if cursor.rowcount == 0:
            raise HTTPException(
               status_code=status.HTTP_400_BAD_REQUEST,
               detail={"error": "No se pudo desactivar el departamento"} 
            )
            
        connection.commit()

        return {"message": "Departamento eliminado correctamente"}
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