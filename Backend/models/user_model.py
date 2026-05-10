import bcrypt
from db import connect_db

def hash_password(password):
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

def verify_password(password, hashed):
    # Fallback for plain text (migration)
    if not hashed.startswith('$2b$'):
        return password == hashed
    return bcrypt.checkpw(password.encode('utf-8'), hashed.encode('utf-8'))

# ── Signup ──────────────────────────────────────────────────
def create_user(name, email, password):
    hashed = hash_password(password)
    conn = connect_db()
    cur = conn.cursor()
    try:
        cur.execute(
            """
            INSERT INTO users (name, email, password)
            VALUES (%s, %s, %s)
            RETURNING id, name, email
            """,
            (name, email, hashed)
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
        "SELECT id, name, email, is_admin, password FROM users WHERE email = %s",
        (email,)
    )
    user = cur.fetchone()
    cur.close()
    conn.close()
    
    if user:
        user_id, name, user_email, is_admin, hashed_pw = user
        if verify_password(password, hashed_pw):
            # If it was plain text, upgrade it to hashed
            if not hashed_pw.startswith('$2b$'):
                update_user_password_direct(user_id, password)
                
            return {"user_id": user_id, "name": name, "email": user_email, "is_admin": is_admin}
    return None

def update_user_password_direct(user_id, password):
    hashed = hash_password(password)
    conn = connect_db()
    cur = conn.cursor()
    cur.execute("UPDATE users SET password = %s WHERE id = %s", (hashed, user_id))
    conn.commit()
    cur.close()
    conn.close()

# ── Check email exists (for forgot-password) ─────────────────
def check_email_exists(email):
    conn = connect_db()
    cur = conn.cursor()
    cur.execute("SELECT id FROM users WHERE email = %s", (email,))
    row = cur.fetchone()
    cur.close()
    conn.close()
    return row is not None


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
        hashed = hash_password(password)
        cur.execute(
            "UPDATE users SET name = %s, password = %s, avatar_url = COALESCE(%s, avatar_url) WHERE id = %s",
            (name, hashed, avatar_url, user_id)
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
