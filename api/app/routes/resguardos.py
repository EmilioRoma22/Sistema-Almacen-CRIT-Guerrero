from fastapi import APIRouter, status, Depends, HTTPException
from app.auth.dependencies import verify_access
from app.core.database import get_connection, fetch_all_dict

router = APIRouter(
    prefix="/resguardos",
    tags=["Resguardos"]
)

@router.post("/agregar_resguardo", status_code=status.HTTP_200_OK)
def agregar_resguardo(usuario=Depends(verify_access([1, 2]))):
    try:
        connection = get_connection()
        cursor = connection.cursor()
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

