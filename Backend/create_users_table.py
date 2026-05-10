from db import connect_db

def create_table():
    conn = connect_db()
    cur = conn.cursor()
    cur.execute("""
    CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name TEXT,
        email TEXT UNIQUE,
        password TEXT
    );
    """)
    conn.commit()
    cur.close()
    conn.close()
    print("Users table created successfully")

if __name__ == '__main__':
    create_table()
