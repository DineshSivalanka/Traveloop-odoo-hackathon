from db import connect_db

def setup():
    try:
        conn = connect_db()
        conn.autocommit = True
        cur = conn.cursor()
        
        # 1. Create users table
        cur.execute("""
            CREATE TABLE IF NOT EXISTS users (
                id SERIAL PRIMARY KEY,
                name TEXT,
                email TEXT UNIQUE,
                password TEXT
            );
        """)
        
        # 2. Create trips table
        cur.execute("""
            CREATE TABLE IF NOT EXISTS trips (
                id SERIAL PRIMARY KEY,
                user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
                title TEXT,
                description TEXT,
                start_date DATE,
                end_date DATE
            );
        """)

        # 3. Create trip_stops table
        cur.execute("""
            CREATE TABLE IF NOT EXISTS trip_stops (
                id SERIAL PRIMARY KEY,
                trip_id INTEGER REFERENCES trips(id) ON DELETE CASCADE,
                city_name TEXT,
                arrival_date DATE,
                departure_date DATE,
                stop_order INTEGER
            );
        """)

        # 4. Create activities table
        cur.execute("""
            CREATE TABLE IF NOT EXISTS activities (
                id SERIAL PRIMARY KEY,
                stop_id INTEGER REFERENCES trip_stops(id) ON DELETE CASCADE,
                activity_name TEXT,
                activity_date DATE,
                estimated_cost NUMERIC,
                notes TEXT
            );
        """)
        
        # 5. Create cities table
        cur.execute("""
            CREATE TABLE IF NOT EXISTS cities (
                id SERIAL PRIMARY KEY,
                name TEXT,
                country TEXT,
                cost_index INTEGER
            );
        """)
        
        # Ensure password column exists if user ran old setup script
        try:
            cur.execute("ALTER TABLE users ADD COLUMN password TEXT;")
            print("✅ Added missing 'password' column to users table.")
        except Exception:
            pass # Column already exists
            
        try:
            cur.execute("ALTER TABLE trips ADD COLUMN user_id INTEGER;")
            print("✅ Added missing 'user_id' column to trips table.")
        except Exception:
            pass # Column already exists
        
        print("✅ Database tables successfully created/verified!")
        cur.close()
        conn.close()
    except Exception as e:
        print("❌ Error setting up database:", e)

if __name__ == "__main__":
    setup()
