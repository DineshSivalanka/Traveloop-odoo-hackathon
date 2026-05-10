from db import connect_db

def get_checklist(trip_id):
    conn = connect_db()
    cur = conn.cursor()
    cur.execute(
        "SELECT id, trip_id, item_name, category, is_packed, created_at FROM checklists WHERE trip_id = %s ORDER BY category, id",
        (trip_id,)
    )
    rows = cur.fetchall()
    cur.close()
    conn.close()
    return [{"id": r[0], "trip_id": r[1], "item_name": r[2], "category": r[3], "is_packed": r[4], "created_at": str(r[5])} for r in rows]

def add_checklist_item(trip_id, item_name, category):
    conn = connect_db()
    cur = conn.cursor()
    cur.execute(
        "INSERT INTO checklists (trip_id, item_name, category) VALUES (%s, %s, %s) RETURNING id",
        (trip_id, item_name, category)
    )
    item_id = cur.fetchone()[0]
    conn.commit()
    cur.close()
    conn.close()
    return item_id

def toggle_checklist_item(item_id, is_packed):
    conn = connect_db()
    cur = conn.cursor()
    cur.execute("UPDATE checklists SET is_packed = %s WHERE id = %s", (is_packed, item_id))
    conn.commit()
    cur.close()
    conn.close()

def delete_checklist_item(item_id):
    conn = connect_db()
    cur = conn.cursor()
    cur.execute("DELETE FROM checklists WHERE id = %s", (item_id,))
    conn.commit()
    cur.close()
    conn.close()

def reset_checklist(trip_id):
    conn = connect_db()
    cur = conn.cursor()
    cur.execute("UPDATE checklists SET is_packed = FALSE WHERE trip_id = %s", (trip_id,))
    conn.commit()
    cur.close()
    conn.close()
