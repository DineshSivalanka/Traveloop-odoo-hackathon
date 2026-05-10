from db import connect_db

def _master_dict(r):
    return {
        "id": r[0], "city_id": r[1], "name": r[2],
        "category": r[3], "base_cost": float(r[4] or 0),
        "duration_hours": float(r[5] or 1),
        "description": r[6], "image_url": r[7]
    }

def get_activities_by_city(city_id):
    conn = connect_db()
    cur = conn.cursor()
    cur.execute(
        "SELECT id, city_id, name, category, base_cost, duration_hours, description, image_url FROM activities_master WHERE city_id = %s ORDER BY category, name",
        (city_id,)
    )
    rows = cur.fetchall()
    cur.close()
    conn.close()
    return [_master_dict(r) for r in rows]

def search_master_activities(query, category=None, max_cost=None):
    conn = connect_db()
    cur = conn.cursor()
    sql = """
        SELECT id, city_id, name, category, base_cost, duration_hours, description, image_url
        FROM activities_master
        WHERE (name ILIKE %s OR description ILIKE %s)
    """
    params = [f"%{query}%", f"%{query}%"]
    if category:
        sql += " AND category ILIKE %s"
        params.append(f"%{category}%")
    if max_cost:
        sql += " AND base_cost <= %s"
        params.append(max_cost)
    sql += " ORDER BY base_cost ASC LIMIT 30"
    cur.execute(sql, params)
    rows = cur.fetchall()
    cur.close()
    conn.close()
    return [_master_dict(r) for r in rows]

def get_city_categories(city_id):
    conn = connect_db()
    cur = conn.cursor()
    cur.execute(
        "SELECT DISTINCT category FROM activities_master WHERE city_id = %s ORDER BY category",
        (city_id,)
    )
    rows = cur.fetchall()
    cur.close()
    conn.close()
    return [r[0] for r in rows if r[0]]


# ── User Activities (per stop) ───────────────────────────────

def _act_dict(r):
    return {
        "id": r[0], "stop_id": r[1], "activity_name": r[2],
        "category": r[3],
        "activity_date": str(r[4]) if r[4] else None,
        "estimated_cost": float(r[5] or 0),
        "duration_hours": float(r[6] or 1),
        "notes": r[7],
        "created_at": str(r[8]) if r[8] else None
    }

def get_activities_for_stop(stop_id):
    conn = connect_db()
    cur = conn.cursor()
    cur.execute(
        "SELECT * FROM activities WHERE stop_id = %s ORDER BY activity_date, created_at",
        (stop_id,)
    )
    rows = cur.fetchall()
    cur.close()
    conn.close()
    return [_act_dict(r) for r in rows]

def add_activity(stop_id, activity_name, category, activity_date, estimated_cost, duration_hours, notes):
    conn = connect_db()
    cur = conn.cursor()
    cur.execute(
        """
        INSERT INTO activities (stop_id, activity_name, category, activity_date, estimated_cost, duration_hours, notes)
        VALUES (%s, %s, %s, %s, %s, %s, %s)
        RETURNING id
        """,
        (stop_id, activity_name, category, activity_date, estimated_cost, duration_hours, notes)
    )
    act_id = cur.fetchone()[0]
    conn.commit()
    cur.close()
    conn.close()
    return act_id

def delete_activity(activity_id):
    conn = connect_db()
    cur = conn.cursor()
    cur.execute("DELETE FROM activities WHERE id = %s", (activity_id,))
    conn.commit()
    cur.close()
    conn.close()
