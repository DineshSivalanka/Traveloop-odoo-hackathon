from db import connect_db

def alter_table():
    conn = connect_db()
    cur = conn.cursor()
    try:
        cur.execute("ALTER TABLE trips ADD COLUMN user_id INTEGER;")
        conn.commit()
        print("Column added.")
    except Exception as e:
        conn.rollback()
        print("Error or already exists:", e)
    finally:
        cur.close()
        conn.close()

if __name__ == '__main__':
    alter_table()
