from fastapi import APIRouter, status, Depends, HTTPException
from app.auth.dependencies import verify_access
from app.core.database import fetch_all_dict, get_connection

router = APIRouter(
    prefix="/departamentos",
    tags=["Departamentos"]
)

@router.get("/obtener_departamentos", status_code=status.HTTP_200_OK)
def obtener_departamentos(usuario=Depends(verify_access)):
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