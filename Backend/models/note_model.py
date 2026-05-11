from db import connect_db

def add_note(trip_id, content, stop_id=None):
    conn = connect_db()
    cur = conn.cursor()
    cur.execute(
        "INSERT INTO trip_notes (trip_id, stop_id, content) VALUES (%s, %s, %s) RETURNING id",
        (trip_id, stop_id, content)
    )
    note_id = cur.fetchone()[0]
    conn.commit()
    cur.close()
    conn.close()
    return note_id

def get_notes_by_trip(trip_id):
    conn = connect_db()
    cur = conn.cursor()
    cur.execute(
        "SELECT id, content, stop_id, created_at FROM trip_notes WHERE trip_id = %s ORDER BY created_at DESC",
        (trip_id,)
    )
    rows = cur.fetchall()
    cur.close()
    conn.close()
    return [{
        "id": r[0],
        "content": r[1],
        "stop_id": r[2],
        "created_at": r[3].isoformat()
    } for r in rows]

def delete_note(note_id):
    conn = connect_db()
    cur = conn.cursor()
    cur.execute("DELETE FROM trip_notes WHERE id = %s", (note_id,))
    conn.commit()
    cur.close()
    conn.close()
