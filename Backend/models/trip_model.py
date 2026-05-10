import secrets
from db import connect_db

def _trip_dict(r):
    return {
        "id": r[0], "user_id": r[1], "title": r[2], "description": r[3],
        "start_date": str(r[4]) if r[4] else None,
        "end_date":   str(r[5]) if r[5] else None,
        "budget":     float(r[6] or 0),
        "cover_image_url": r[7],
        "is_public":  r[8],
        "share_token": r[9],
        "created_at": str(r[10]) if r[10] else None
    }

def create_trip(user_id, title, description, start_date, end_date, budget, cover_image_url):
    conn = connect_db()
    cur = conn.cursor()
    cur.execute(
        """
        INSERT INTO trips (user_id, title, description, start_date, end_date, budget, cover_image_url)
        VALUES (%s, %s, %s, %s, %s, %s, %s)
        RETURNING id
        """,
        (user_id, title, description, start_date, end_date, budget, cover_image_url)
    )
    trip_id = cur.fetchone()[0]
    conn.commit()
    cur.close()
    conn.close()
    return trip_id

def get_trips_by_user(user_id):
    conn = connect_db()
    cur = conn.cursor()
    cur.execute(
        "SELECT * FROM trips WHERE user_id = %s ORDER BY created_at DESC",
        (user_id,)
    )
    rows = cur.fetchall()
    cur.close()
    conn.close()
    return [_trip_dict(r) for r in rows]

def get_trip_by_id(trip_id):
    conn = connect_db()
    cur = conn.cursor()
    cur.execute("SELECT * FROM trips WHERE id = %s", (trip_id,))
    row = cur.fetchone()
    cur.close()
    conn.close()
    return _trip_dict(row) if row else None

def update_trip(trip_id, title, description, start_date, end_date, budget, cover_image_url):
    conn = connect_db()
    cur = conn.cursor()
    cur.execute(
        """
        UPDATE trips SET title=%s, description=%s, start_date=%s,
        end_date=%s, budget=%s, cover_image_url=%s WHERE id=%s
        """,
        (title, description, start_date, end_date, budget, cover_image_url, trip_id)
    )
    conn.commit()
    cur.close()
    conn.close()

def delete_trip(trip_id):
    conn = connect_db()
    cur = conn.cursor()
    cur.execute("DELETE FROM trips WHERE id = %s", (trip_id,))
    conn.commit()
    cur.close()
    conn.close()

def make_trip_public(trip_id):
    token = secrets.token_urlsafe(16)
    conn = connect_db()
    cur = conn.cursor()
    cur.execute(
        "UPDATE trips SET is_public = TRUE, share_token = %s WHERE id = %s RETURNING share_token",
        (token, trip_id)
    )
    result = cur.fetchone()
    conn.commit()
    cur.close()
    conn.close()
    return result[0] if result else None

def get_trip_by_token(token):
    conn = connect_db()
    cur = conn.cursor()
    cur.execute("SELECT * FROM trips WHERE share_token = %s AND is_public = TRUE", (token,))
    row = cur.fetchone()
    cur.close()
    conn.close()
    return _trip_dict(row) if row else None

def get_trip_budget_breakdown(trip_id):
    """Returns total actual spend (sum of activities) vs allocated budget."""
    conn = connect_db()
    cur = conn.cursor()
    cur.execute(
        """
        SELECT
            ts.city_name,
            COALESCE(SUM(a.estimated_cost), 0) AS city_cost
        FROM trip_stops ts
        LEFT JOIN activities a ON a.stop_id = ts.id
        WHERE ts.trip_id = %s
        GROUP BY ts.id, ts.city_name, ts.stop_order
        ORDER BY ts.stop_order
        """,
        (trip_id,)
    )
    rows = cur.fetchall()
    cur.execute(
        "SELECT budget FROM trips WHERE id = %s",
        (trip_id,)
    )
    budget_row = cur.fetchone()
    cur.close()
    conn.close()
    allocated = float(budget_row[0] or 0) if budget_row else 0
    breakdown = [{"city": r[0], "cost": float(r[1])} for r in rows]
    total_spent = sum(b["cost"] for b in breakdown)
    return {
        "allocated_budget": allocated,
        "total_spent":      total_spent,
        "remaining":        allocated - total_spent,
        "breakdown":        breakdown
    }

def get_full_trip(trip_id):
    """Returns trip + all stops + all activities (for itinerary view)."""
    conn = connect_db()
    cur = conn.cursor()
    
    cur.execute("SELECT * FROM trips WHERE id = %s", (trip_id,))
    trip_row = cur.fetchone()
    if not trip_row:
        cur.close()
        conn.close()
        return {"trip": None, "details": []}
        
    cur.execute(
        "SELECT id, trip_id, city_name, city_id, arrival_date, departure_date, stop_order, notes, created_at FROM trip_stops WHERE trip_id = %s ORDER BY stop_order",
        (trip_id,)
    )
    stop_rows = cur.fetchall()
    
    details = []
    for s in stop_rows:
        stop_dict = {
            "id": s[0], "trip_id": s[1], "city_name": s[2], "city_id": s[3],
            "arrival_date": str(s[4]) if s[4] else None,
            "departure_date": str(s[5]) if s[5] else None,
            "stop_order": s[6], "notes": s[7]
        }
        
        cur.execute(
            "SELECT id, stop_id, activity_name, category, activity_date, estimated_cost, duration_hours, notes FROM activities WHERE stop_id = %s ORDER BY activity_date, created_at",
            (s[0],)
        )
        act_rows = cur.fetchall()
        
        acts = []
        for a in act_rows:
            acts.append({
                "id": a[0], "stop_id": a[1], "activity_name": a[2],
                "category": a[3], "activity_date": str(a[4]) if a[4] else None,
                "estimated_cost": float(a[5] or 0),
                "duration_hours": float(a[6] or 1),
                "notes": a[7]
            })
            
        details.append({"stop": stop_dict, "activities": acts})
        
    cur.close()
    conn.close()
    return {"trip": _trip_dict(trip_row), "details": details}
