from db import connect_db

# ── Signup ──────────────────────────────────────────────────
def create_user(name, email, password):
    conn = connect_db()
    cur = conn.cursor()
    try:
        cur.execute(
            """
            INSERT INTO users (name, email, password)
            VALUES (%s, %s, %s)
            RETURNING id, name, email
            """,
            (name, email, password)
        )
        user = cur.fetchone()
        conn.commit()
        return {"user_id": user[0], "name": user[1], "email": user[2]}
    except Exception as e:
        conn.rollback()
        raise e
    finally:
        cur.close()
        conn.close()

# ── Login ────────────────────────────────────────────────────
def verify_login(email, password):
    conn = connect_db()
    cur = conn.cursor()
    cur.execute(
        "SELECT id, name, email, is_admin FROM users WHERE email = %s AND password = %s",
        (email, password)
    )
    user = cur.fetchone()
    cur.close()
    conn.close()
    if user:
        return {"user_id": user[0], "name": user[1], "email": user[2], "is_admin": user[3]}
    return None

# ── Get Profile ──────────────────────────────────────────────
def get_user_profile(user_id):
    conn = connect_db()
    cur = conn.cursor()
    cur.execute(
        "SELECT id, name, email, avatar_url, is_admin, created_at FROM users WHERE id = %s",
        (user_id,)
    )
    row = cur.fetchone()
    cur.close()
    conn.close()
    if row:
        return {
            "id":         row[0],
            "name":       row[1],
            "email":      row[2],
            "avatar_url": row[3],
            "is_admin":   row[4],
            "created_at": str(row[5])
        }
    return None

# ── Update Profile ───────────────────────────────────────────
def update_user_profile(user_id, name, password=None, avatar_url=None):
    conn = connect_db()
    cur = conn.cursor()
    if password:
        cur.execute(
            "UPDATE users SET name = %s, password = %s, avatar_url = COALESCE(%s, avatar_url) WHERE id = %s",
            (name, password, avatar_url, user_id)
        )
    else:
        cur.execute(
            "UPDATE users SET name = %s, avatar_url = COALESCE(%s, avatar_url) WHERE id = %s",
            (name, avatar_url, user_id)
        )
    conn.commit()
    cur.close()
    conn.close()

# ── All users (admin) ────────────────────────────────────────
def get_all_users():
    conn = connect_db()
    cur = conn.cursor()
    cur.execute("SELECT id, name, email, is_admin, created_at FROM users ORDER BY created_at DESC")
    rows = cur.fetchall()
    cur.close()
    conn.close()
    return [
        {"id": r[0], "name": r[1], "email": r[2], "is_admin": r[3], "created_at": str(r[4])}
        for r in rows
    ]
