import pyodbc
from app.config.settings import get_settings

settings = get_settings()

def get_db_connection():
    conn = pyodbc.connect(settings.DB_CONNECTION_STRING)
    return conn

def get_db():
    conn = get_db_connection()
    try:
        yield conn
    finally:
        conn.close()