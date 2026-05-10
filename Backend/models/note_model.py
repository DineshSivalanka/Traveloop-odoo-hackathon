from db import connect_db

def get_trip_notes(trip_id, stop_id=None):
    conn = connect_db()
    cur = conn.cursor()
    if stop_id:
        cur.execute(
            "SELECT id, trip_id, stop_id, note_text, created_at FROM trip_notes WHERE trip_id = %s AND stop_id = %s ORDER BY created_at DESC",
            (trip_id, stop_id)
        )
    else:
        cur.execute(
            "SELECT id, trip_id, stop_id, note_text, created_at FROM trip_notes WHERE trip_id = %s ORDER BY created_at DESC",
            (trip_id,)
        )
    rows = cur.fetchall()
    cur.close()
    conn.close()
    return [{"id": r[0], "trip_id": r[1], "stop_id": r[2], "note_text": r[3], "created_at": str(r[4])} for r in rows]

def add_trip_note(trip_id, note_text, stop_id=None):
    conn = connect_db()
    cur = conn.cursor()
    cur.execute(
        "INSERT INTO trip_notes (trip_id, stop_id, note_text) VALUES (%s, %s, %s) RETURNING id, created_at",
        (trip_id, stop_id, note_text)
    )
    result = cur.fetchone()
    conn.commit()
    cur.close()
    conn.close()
    return {"id": result[0], "created_at": str(result[1])}

def update_trip_note(note_id, note_text):
    conn = connect_db()
    cur = conn.cursor()
    cur.execute("UPDATE trip_notes SET note_text = %s WHERE id = %s", (note_text, note_id))
    conn.commit()
    cur.close()
    conn.close()

def delete_trip_note(note_id):
    conn = connect_db()
    cur = conn.cursor()
    cur.execute("DELETE FROM trip_notes WHERE id = %s", (note_id,))
    conn.commit()
    cur.close()
    conn.close()
