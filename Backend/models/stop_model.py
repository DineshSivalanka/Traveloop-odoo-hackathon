from db import connect_db

def _stop_dict(r):
    return {
        "id": r[0], "trip_id": r[1], "city_name": r[2], "city_id": r[3],
        "arrival_date":   str(r[4]) if r[4] else None,
        "departure_date": str(r[5]) if r[5] else None,
        "stop_order": r[6], "notes": r[7],
        "created_at": str(r[8]) if r[8] else None
    }

def get_stops_by_trip(trip_id):
    conn = connect_db()
    cur = conn.cursor()
    cur.execute(
        "SELECT * FROM trip_stops WHERE trip_id = %s ORDER BY stop_order",
        (trip_id,)
    )
    rows = cur.fetchall()
    cur.close()
    conn.close()
    return [_stop_dict(r) for r in rows]

def get_stop_by_id(stop_id):
    conn = connect_db()
    cur = conn.cursor()
    cur.execute("SELECT * FROM trip_stops WHERE id = %s", (stop_id,))
    row = cur.fetchone()
    cur.close()
    conn.close()
    return _stop_dict(row) if row else None

def add_stop(trip_id, city_name, city_id, arrival_date, departure_date, stop_order, notes):
    conn = connect_db()
    cur = conn.cursor()
    cur.execute(
        """
        INSERT INTO trip_stops (trip_id, city_name, city_id, arrival_date, departure_date, stop_order, notes)
        VALUES (%s, %s, %s, %s, %s, %s, %s)
        RETURNING id
        """,
        (trip_id, city_name, city_id, arrival_date, departure_date, stop_order, notes)
    )
    stop_id = cur.fetchone()[0]
    conn.commit()
    cur.close()
    conn.close()
    return stop_id

def update_stop(stop_id, city_name, arrival_date, departure_date, stop_order, notes):
    conn = connect_db()
    cur = conn.cursor()
    cur.execute(
        """
        UPDATE trip_stops
        SET city_name=%s, arrival_date=%s, departure_date=%s, stop_order=%s, notes=%s
        WHERE id=%s
        """,
        (city_name, arrival_date, departure_date, stop_order, notes, stop_id)
    )
    conn.commit()
    cur.close()
    conn.close()

def delete_stop(stop_id):
    conn = connect_db()
    cur = conn.cursor()
    cur.execute("DELETE FROM trip_stops WHERE id = %s", (stop_id,))
    conn.commit()
    cur.close()
    conn.close()

def reorder_stops(trip_id, ordered_ids):
    """ordered_ids: list of stop IDs in the new desired order."""
    conn = connect_db()
    cur = conn.cursor()
    for index, stop_id in enumerate(ordered_ids, start=1):
        cur.execute(
            "UPDATE trip_stops SET stop_order = %s WHERE id = %s AND trip_id = %s",
            (index, stop_id, trip_id)
        )
    conn.commit()
    cur.close()
    conn.close()
