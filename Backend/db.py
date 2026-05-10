import psycopg2

def connect_db():
    conn = psycopg2.connect(
        dbname="Traveloop",
        user="postgres",
        password="Postgrelsql",
        host="localhost",
        port="5432"
    )
    return conn