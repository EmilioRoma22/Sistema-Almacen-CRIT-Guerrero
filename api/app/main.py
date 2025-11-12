from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes import usuarios, departamentos, categorias, entradas, productos,archivos
from dotenv import load_dotenv
import os

load_dotenv()
app = FastAPI()

IP_FRONTEND_NETWORK = os.getenv("IP_FRONTEND_NETWORK")

origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    IP_FRONTEND_NETWORK
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(usuarios.router)
app.include_router(departamentos.router)
app.include_router(categorias.router)
app.include_router(entradas.router)
app.include_router(productos.router)
app.include_router(archivos.router)
