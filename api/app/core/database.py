import os
import pyodbc
from dotenv import load_dotenv

load_dotenv()
bdconfig = {
    'DRIVER': os.getenv('DB_DRIVER'),
    'SERVER': os.getenv('DB_SERVER'),
    'DATABASE': os.getenv('DB_DATABASE'),
    'Authentication': os.getenv('DB_AUTH'),
    'TrustServerCertificate': os.getenv('DB_TRUST_CERT')
}

def get_connection():
    conn_str = ';'.join([f"{k}={v}" for k, v in bdconfig.items() if v])
    return pyodbc.connect(conn_str)

def fetch_all_dict(cursor):
    columns = [column[0] for column in cursor.description]
    return [dict(zip(columns, row)) for row in cursor.fetchall()]