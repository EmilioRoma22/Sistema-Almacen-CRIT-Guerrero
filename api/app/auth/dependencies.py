from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from app.auth.jwt_handler import decodificar_token
from typing import List

auth_scheme = HTTPBearer()

def verify_token(credentials: HTTPAuthorizationCredentials = Depends(auth_scheme)):
    token = credentials.credentials
    payload = decodificar_token(token)
    if not payload or "id_usuario" not in payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token inválido"
        )
    return payload

def verify_access(allowed_departments: List[int] = None):
    allowed_departments = allowed_departments or []

    def dependency(payload=Depends(verify_token)):
        id_departamento = payload.get("id_departamento")

        if not allowed_departments:
            return payload
        
        if id_departamento not in allowed_departments:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail={"error": "No tienes permiso para realizar esta acción"}
            )
        return payload

    return dependency
