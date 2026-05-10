from db import connect_db

def add_city(name, country, cost_index):
    conn = connect_db()
    cur = conn.cursor()

    cur.execute(
        "INSERT INTO cities (name, country, cost_index) VALUES (%s, %s, %s) RETURNING id",
        (name, country, cost_index)
    )

    city_id = cur.fetchone()[0]
    conn.commit()
    cur.close()
    conn.close()
    return city_id
