from db import connect_db

def check_data():
    try:
        conn = connect_db()
        cur = conn.cursor()
        
        cur.execute("SELECT COUNT(*) FROM activities_master")
        count = cur.fetchone()[0]
        print(f"Total activities in master: {count}")
        
        cur.execute("SELECT id, name FROM cities WHERE name ILIKE 'Tokyo'")
        tokyo = cur.fetchone()
        if tokyo:
            print(f"Tokyo found with ID: {tokyo[0]}")
            cur.execute("SELECT COUNT(*) FROM activities_master WHERE city_id = %s", (tokyo[0],))
            t_count = cur.fetchone()[0]
            print(f"Activities for Tokyo (ID {tokyo[0]}): {t_count}")
        else:
            print("Tokyo not found in cities table.")
            
        cur.close()
        conn.close()
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    check_data()
