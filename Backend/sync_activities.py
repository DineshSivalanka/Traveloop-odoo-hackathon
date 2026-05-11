from db import connect_db

def fix_activities():
    try:
        conn = connect_db()
        cur = conn.cursor()
        
        # Mapping of City Name to its activities from the SQL file
        # We use this to dynamically find the correct ID in the user's DB
        data = {
            "Tokyo": [
                ('Senso-ji Temple Visit',   'Culture',     0,    2.0, 'Tokyo\'s oldest and most significant temple.'),
                ('Shibuya Crossing',        'Sightseeing', 0,    1.0, 'World\'s busiest pedestrian scramble crossing.'),
                ('Tsukiji Outer Market',    'Food',        1500, 2.0, 'Fresh sushi, sashimi, and Japanese street food.'),
                ('Akihabara District',      'Shopping',    0,    3.0, 'Electric Town for anime, gadgets, and gaming.'),
                ('Tokyo Skytree',           'Sightseeing', 2000, 2.0, 'Panoramic views from 634m above Tokyo.'),
                ('Mt Fuji Day Trip',        'Adventure',   3500, 10.0,'Iconic volcano hike or scenic bus tour.')
            ],
            "Mumbai": [
                ('Gateway of India Tour',    'Sightseeing', 200,  2.0, 'Iconic arch monument on the Arabian Sea.'),
                ('Elephanta Caves Ferry',    'Culture',     500,  4.0, 'UNESCO heritage cave temples on Elephanta Island.'),
                ('Bollywood Studio Tour',    'Culture',     1500, 3.0, 'Behind-the-scenes tour of Bollywood studios.'),
                ('Street Food Walk Juhu',    'Food',        400,  2.0, 'Taste vada pav, pani puri, and bhel puri.'),
                ('Marine Drive Sunset Walk', 'Sightseeing', 0,    1.0, 'Stroll along the Queen\'s Necklace at dusk.'),
                ('Dharavi Heritage Tour',    'Culture',     700,  3.0, 'Guided tour of Asia\'s largest township.')
            ],
            "Delhi": [
                ('Red Fort Visit',           'Culture',     350,  2.0, 'Mughal-era fort and UNESCO World Heritage Site.'),
                ('Qutub Minar Tour',         'Sightseeing', 300,  2.0, 'Tallest brick minaret in the world.'),
                ('Chandni Chowk Food Tour',  'Food',        500,  3.0, 'Historic bazaar with parathas and jalebi.'),
                ('Humayuns Tomb Visit',      'Culture',     350,  2.0, 'Precursor to the Taj Mahal in lush gardens.'),
                ('India Gate Walk',          'Sightseeing', 0,    1.0, 'War memorial on the ceremonial boulevard.'),
                ('Akshardham Temple',        'Culture',     300,  3.0, 'Stunning modern temple of architecture.')
            ]
            # ... other cities can be added if needed, but Tokyo is the priority
        }

        for city_name, activities in data.items():
            # 1. Find correct city_id
            cur.execute("SELECT id FROM cities WHERE name ILIKE %s", (city_name,))
            res = cur.fetchone()
            if not res:
                print(f"City '{city_name}' not found. Skipping.")
                continue
            
            city_id = res[0]
            print(f"Syncing activities for {city_name} (ID: {city_id})...")

            # 2. Clear existing and re-insert
            cur.execute("DELETE FROM activities_master WHERE city_id = %s", (city_id,))
            for act in activities:
                cur.execute(
                    """
                    INSERT INTO activities_master (city_id, name, category, base_cost, duration_hours, description)
                    VALUES (%s, %s, %s, %s, %s, %s)
                    """,
                    (city_id, act[0], act[1], act[2], act[3], act[4])
                )
        
        conn.commit()
        print("Database sync complete!")
        cur.close()
        conn.close()
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    fix_activities()
