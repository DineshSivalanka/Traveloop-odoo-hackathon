from db import connect_db

def setup():
    try:
        conn = connect_db()
        conn.autocommit = True
        cur = conn.cursor()
        
        # Create users table
        cur.execute("""
            CREATE TABLE IF NOT EXISTS users (
                id SERIAL PRIMARY KEY,
                name VARCHAR(100),
                email VARCHAR(100) UNIQUE
            );
        """)
        
        # Insert a dummy user so the API has something to return
        cur.execute("""
            INSERT INTO users (name, email) 
            VALUES ('John Doe', 'john@example.com')
            ON CONFLICT DO NOTHING;
        """)
        
        print("✅ Table 'users' created successfully and dummy data inserted!")
        cur.close()
        conn.close()
    except Exception as e:
        print("❌ Error setting up database:", e)

if __name__ == "__main__":
    setup()
