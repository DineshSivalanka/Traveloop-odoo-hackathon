from db import connect_db

def get_dashboard_data(user_id):
    conn = connect_db()
    cur = conn.cursor()

    # 1. Get upcoming trips
    cur.execute("SELECT * FROM trips WHERE user_id = %s ORDER BY start_date ASC LIMIT 3", (user_id,))
    recent_trips = cur.fetchall()

    # 2. Get popular/recommended cities
    cur.execute("SELECT * FROM cities LIMIT 4")
    popular_cities = cur.fetchall()

    # 3. Calculate total budget for this user
    cur.execute("""
        SELECT SUM(a.estimated_cost) 
        FROM activities a
        JOIN trip_stops ts ON a.stop_id = ts.id
        JOIN trips t ON ts.trip_id = t.id
        WHERE t.user_id = %s
    """, (user_id,))
    total_budget = cur.fetchone()[0]
    
    if total_budget is None:
        total_budget = 0

    cur.close()
    conn.close()

    return {
        "recent_trips": recent_trips,
        "popular_cities": popular_cities,
        "total_budget": float(total_budget)
    }
