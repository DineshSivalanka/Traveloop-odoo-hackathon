from db import connect_db

def search_cities(query):
    conn = connect_db()
    cur = conn.cursor()
    cur.execute(
        """
        SELECT id, name, country, region, cost_index, popularity, description, image_url
        FROM cities
        WHERE name ILIKE %s OR country ILIKE %s OR region ILIKE %s
        ORDER BY popularity DESC
        LIMIT 20
        """,
        (f"%{query}%", f"%{query}%", f"%{query}%")
    )
    rows = cur.fetchall()
    cur.close()
    conn.close()
    return [_city_row(r) for r in rows]

def get_all_cities(region=None, country=None):
    conn = connect_db()
    cur = conn.cursor()
    if region:
        cur.execute(
            "SELECT id, name, country, region, cost_index, popularity, description, image_url FROM cities WHERE region ILIKE %s ORDER BY popularity DESC",
            (f"%{region}%",)
        )
    elif country:
        cur.execute(
            "SELECT id, name, country, region, cost_index, popularity, description, image_url FROM cities WHERE country ILIKE %s ORDER BY popularity DESC",
            (f"%{country}%",)
        )
    else:
        cur.execute(
            "SELECT id, name, country, region, cost_index, popularity, description, image_url FROM cities ORDER BY popularity DESC LIMIT 50"
        )
    rows = cur.fetchall()
    cur.close()
    conn.close()
    return [_city_row(r) for r in rows]

def get_city_by_id(city_id):
    conn = connect_db()
    cur = conn.cursor()
    cur.execute(
        "SELECT id, name, country, region, cost_index, popularity, description, image_url FROM cities WHERE id = %s",
        (city_id,)
    )
    row = cur.fetchone()
    cur.close()
    conn.close()
    if row:
        return _city_row(row)
    return None

def get_popular_cities(limit=6):
    conn = connect_db()
    cur = conn.cursor()
    cur.execute(
        "SELECT id, name, country, region, cost_index, popularity, description, image_url FROM cities ORDER BY popularity DESC LIMIT %s",
        (limit,)
    )
    rows = cur.fetchall()
    cur.close()
    conn.close()
    return [_city_row(r) for r in rows]

def _city_row(r):
    return {
        "id": r[0], "name": r[1], "country": r[2],
        "region": r[3], "cost_index": float(r[4] or 0),
        "popularity": r[5], "description": r[6],
        "image_url": r[7] if len(r) > 7 else None
    }
