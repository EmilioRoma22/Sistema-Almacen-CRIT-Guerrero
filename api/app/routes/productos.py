from fastapi import APIRouter, status, HTTPException, Depends
from app.core.database import fetch_all_dict, get_connection
from app.auth.dependencies import verify_access

router = APIRouter(
    prefix="/productos",
    tags=["Productos"]
)

@router.get("/obtener_productos", status_code=status.HTTP_200_OK)
def obtener_productos(usuario=Depends(verify_access([1, 2]))):
    try:
        connection = get_connection()
        cursor = connection.cursor()
        
        cursor.execute("SELECT id_producto, nombre_producto, unidad FROM productos")
        productos_ = fetch_all_dict(cursor)
        
        return productos_
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