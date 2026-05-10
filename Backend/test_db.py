from db import connect_db

try:
    conn = connect_db()
    print("Database connected successfully!")
    conn.close()
except Exception as e:
    print("Error:", e)
