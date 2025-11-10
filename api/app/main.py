from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes import usuarios, departamentos
from dotenv import load_dotenv

load_dotenv()
app = FastAPI()

origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://192.168.1.81:5173"
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