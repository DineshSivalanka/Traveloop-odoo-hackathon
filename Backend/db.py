import psycopg2
import os
from dotenv import load_dotenv

load_dotenv()

def connect_db():
    # If DATABASE_URL is present (Production), use it
    db_url = os.environ.get("DATABASE_URL")
    if db_url:
        return psycopg2.connect(db_url)
    
    # Fallback to Local (Development)
    return psycopg2.connect(
        dbname=os.environ.get("DB_NAME", "Traveloop"),
        user=os.environ.get("DB_USER", "postgres"),
        password=os.environ.get("DB_PASS", "Postgrelsql"),
        host=os.environ.get("DB_HOST", "localhost"),
        port=os.environ.get("DB_PORT", "5432")
    )