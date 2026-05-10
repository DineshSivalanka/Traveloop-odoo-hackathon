from db import connect_db

def get_dashboard_data(user_id):
    conn = connect_db()
    cur = conn.cursor()

    # Recent trips (up to 6)
    cur.execute(
        "SELECT id, user_id, title, description, start_date, end_date, budget, cover_image_url, is_public, share_token, created_at FROM trips WHERE user_id = %s ORDER BY created_at DESC LIMIT 6",
        (user_id,)
    )
    recent_trips = [
        {"id": r[0], "user_id": r[1], "title": r[2], "description": r[3],
         "start_date": str(r[4]) if r[4] else None,
         "end_date":   str(r[5]) if r[5] else None,
         "budget": float(r[6] or 0), "cover_image_url": r[7],
         "is_public": r[8], "share_token": r[9], "created_at": str(r[10])}
        for r in cur.fetchall()
    ]

    # Popular cities
    cur.execute(
        "SELECT id, name, country, region, cost_index, popularity, description FROM cities ORDER BY popularity DESC LIMIT 6"
    )
    popular_cities = [
        {"id": r[0], "name": r[1], "country": r[2], "region": r[3],
         "cost_index": float(r[4] or 0), "popularity": r[5], "description": r[6]}
        for r in cur.fetchall()
    ]

    # Total actual spend across all trips
    cur.execute(
        """
        SELECT COALESCE(SUM(a.estimated_cost), 0)
        FROM activities a
        JOIN trip_stops ts ON a.stop_id = ts.id
        JOIN trips t ON ts.trip_id = t.id
        WHERE t.user_id = %s
        """,
        (user_id,)
    )
    total_spent = float(cur.fetchone()[0])

    # Total allocated budget
    cur.execute("SELECT COALESCE(SUM(budget), 0) FROM trips WHERE user_id = %s", (user_id,))
    total_budget = float(cur.fetchone()[0])

    # User name
    cur.execute("SELECT name FROM users WHERE id = %s", (user_id,))
    name_row = cur.fetchone()
    user_name = name_row[0] if name_row else "Traveler"

    # Trip count
    cur.execute("SELECT COUNT(*) FROM trips WHERE user_id = %s", (user_id,))
    trip_count = cur.fetchone()[0]

    cur.close()
    conn.close()

    return {
        "user_name":     user_name,
        "trip_count":    trip_count,
        "recent_trips":  recent_trips,
        "popular_cities": popular_cities,
        "total_budget":  total_budget,
        "total_spent":   total_spent,
        "remaining":     total_budget - total_spent
    }

def get_admin_analytics():
    conn = connect_db()
    cur = conn.cursor()

    # Total counts
    cur.execute("SELECT COUNT(*) FROM users")
    total_users = cur.fetchone()[0]

    cur.execute("SELECT COUNT(*) FROM trips")
    total_trips = cur.fetchone()[0]

    cur.execute("SELECT COUNT(*) FROM trip_stops")
    total_stops = cur.fetchone()[0]

    cur.execute("SELECT COUNT(*) FROM activities")
    total_activities = cur.fetchone()[0]

    # Top cities by stop count
    cur.execute(
        """
        SELECT ts.city_name, COUNT(*) as cnt
        FROM trip_stops ts
        GROUP BY ts.city_name
        ORDER BY cnt DESC
        LIMIT 10
        """
    )
    top_cities = [{"city": r[0], "count": r[1]} for r in cur.fetchall()]

    # Recent users
    cur.execute(
        "SELECT id, name, email, created_at FROM users ORDER BY created_at DESC LIMIT 10"
    )
    recent_users = [
        {"id": r[0], "name": r[1], "email": r[2], "created_at": str(r[3])}
        for r in cur.fetchall()
    ]

    # Trips per day (last 7 days)
    cur.execute(
        """
        SELECT DATE(created_at) AS day, COUNT(*) AS cnt
        FROM trips
        WHERE created_at >= NOW() - INTERVAL '7 days'
        GROUP BY day
        ORDER BY day
        """
    )
    trips_per_day = [{"day": str(r[0]), "count": r[1]} for r in cur.fetchall()]

    cur.close()
    conn.close()

    return {
        "total_users":     total_users,
        "total_trips":     total_trips,
        "total_stops":     total_stops,
        "total_activities": total_activities,
        "top_cities":      top_cities,
        "recent_users":    recent_users,
        "trips_per_day":   trips_per_day
    }
