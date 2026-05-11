-- ============================================================
--  TRAVELOOP – Run this entire file in pgAdmin or psql
--  Database: Traveloop
-- ============================================================

-- ─────────────────────────────────────────
-- TABLE 1: users
-- ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
    id          SERIAL PRIMARY KEY,
    name        VARCHAR(120)        NOT NULL,
    email       VARCHAR(200) UNIQUE NOT NULL,
    password    VARCHAR(255)        NOT NULL,
    avatar_url  TEXT,
    is_admin    BOOLEAN             DEFAULT FALSE,
    created_at  TIMESTAMP           DEFAULT NOW()
);

-- ─────────────────────────────────────────
-- TABLE 2: cities
-- ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS cities (
    id          SERIAL PRIMARY KEY,
    name        VARCHAR(120) UNIQUE NOT NULL,
    country     VARCHAR(120),
    region      VARCHAR(120),
    cost_index  NUMERIC(8,2)  DEFAULT 0,
    popularity  INTEGER       DEFAULT 0,
    image_url   TEXT,
    description TEXT
);

-- Allow larger city cost values used in seed data (e.g. 12000)
ALTER TABLE cities
    ALTER COLUMN cost_index TYPE NUMERIC(8,2);

-- ─────────────────────────────────────────
-- TABLE 3: trips
-- ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS trips (
    id              SERIAL PRIMARY KEY,
    user_id         INTEGER       NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title           VARCHAR(200)  NOT NULL,
    description     TEXT,
    start_date      DATE,
    end_date        DATE,
    budget          NUMERIC(12,2) DEFAULT 0,
    cover_image_url TEXT,
    is_public       BOOLEAN       DEFAULT FALSE,
    share_token     VARCHAR(64)   UNIQUE,
    created_at      TIMESTAMP     DEFAULT NOW()
);

-- ─────────────────────────────────────────
-- TABLE 4: trip_stops
-- ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS trip_stops (
    id              SERIAL PRIMARY KEY,
    trip_id         INTEGER      NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
    city_name       VARCHAR(120) NOT NULL,
    city_id         INTEGER      REFERENCES cities(id),
    arrival_date    DATE,
    departure_date  DATE,
    stop_order      INTEGER      DEFAULT 1,
    notes           TEXT,
    created_at      TIMESTAMP    DEFAULT NOW()
);

-- ─────────────────────────────────────────
-- TABLE 5: activities_master  (catalogue)
-- ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS activities_master (
    id              SERIAL PRIMARY KEY,
    city_id         INTEGER       REFERENCES cities(id) ON DELETE SET NULL,
    name            VARCHAR(200)  NOT NULL,
    category        VARCHAR(80),
    base_cost       NUMERIC(10,2) DEFAULT 0,
    duration_hours  NUMERIC(4,1)  DEFAULT 1,
    description     TEXT,
    image_url       TEXT
);

-- ─────────────────────────────────────────
-- TABLE 6: activities  (user-added per stop)
-- ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS activities (
    id              SERIAL PRIMARY KEY,
    stop_id         INTEGER       NOT NULL REFERENCES trip_stops(id) ON DELETE CASCADE,
    activity_name   VARCHAR(200)  NOT NULL,
    category        VARCHAR(80),
    activity_date   DATE,
    estimated_cost  NUMERIC(10,2) DEFAULT 0,
    duration_hours  NUMERIC(4,1)  DEFAULT 1,
    notes           TEXT,
    created_at      TIMESTAMP     DEFAULT NOW()
);

-- ─────────────────────────────────────────
-- TABLE 7: checklists  (packing list)
-- ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS checklists (
    id          SERIAL PRIMARY KEY,
    trip_id     INTEGER      NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
    item_name   VARCHAR(200) NOT NULL,
    category    VARCHAR(80)  DEFAULT 'General',
    is_packed   BOOLEAN      DEFAULT FALSE,
    created_at  TIMESTAMP    DEFAULT NOW()
);

-- ─────────────────────────────────────────
-- TABLE 8: trip_notes  (journal)
-- ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS trip_notes (
    id          SERIAL PRIMARY KEY,
    trip_id     INTEGER   NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
    stop_id     INTEGER   REFERENCES trip_stops(id) ON DELETE SET NULL,
    note_text   TEXT      NOT NULL,
    created_at  TIMESTAMP DEFAULT NOW()
);

-- ─────────────────────────────────────────
-- INDEXES
-- ─────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_trips_user      ON trips(user_id);
CREATE INDEX IF NOT EXISTS idx_stops_trip      ON trip_stops(trip_id);
CREATE INDEX IF NOT EXISTS idx_activities_stop ON activities(stop_id);
CREATE INDEX IF NOT EXISTS idx_checklists_trip ON checklists(trip_id);
CREATE INDEX IF NOT EXISTS idx_notes_trip      ON trip_notes(trip_id);
CREATE INDEX IF NOT EXISTS idx_cities_name     ON cities(name);
CREATE INDEX IF NOT EXISTS idx_master_city     ON activities_master(city_id);

-- ============================================================
--  SEED DATA – Cities
-- ============================================================


-- alter First
ALTER TABLE cities
ALTER COLUMN cost_index TYPE NUMERIC(8,2);


INSERT INTO cities (name, country, region, cost_index, popularity, description, image_url) VALUES
('Mumbai',         'India',        'South Asia',      2500, 95, 'Financial capital of India with iconic landmarks.', NULL),
('Delhi',          'India',        'South Asia',      2200, 92, 'India''s capital with historic Mughal architecture.', 'https://images.unsplash.com/photo-1587474260584-1f3c8b44379f?auto=format&fit=crop&w=1200&q=80'),
('Jaipur',         'India',        'South Asia',      1800, 88, 'The Pink City, gateway to Rajasthan.', NULL),
('Goa',            'India',        'South Asia',      2800, 90, 'Tropical beaches, seafood, and vibrant nightlife.', NULL),
('Bangalore',      'India',        'South Asia',      2600, 85, 'Silicon Valley of India with a cool climate.', NULL),
('Kerala',         'India',        'South Asia',      2400, 87, 'Serene backwaters, spices, and Ayurveda.', NULL),
('Varanasi',       'India',        'South Asia',      1600, 82, 'One of the world''s oldest living cities.', NULL),
('Agra',           'India',        'South Asia',      1700, 91, 'Home to the iconic Taj Mahal.', NULL),
('Chennai',        'India',        'South Asia',      2100, 80, 'Cultural capital of South India.', NULL),
('Kolkata',        'India',        'South Asia',      1900, 78, 'City of joy with colonial heritage and culture.', 'https://images.unsplash.com/photo-1571679654681-ba01b9e1e117?auto=format&fit=crop&w=1200&q=80'),
('Tokyo',          'Japan',        'East Asia',       7500, 98, 'Ultra-modern metropolis blending tradition and innovation.', NULL),
('Bangkok',        'Thailand',     'Southeast Asia',  3500, 96, 'Vibrant street life, temples, and floating markets.', 'https://images.unsplash.com/photo-1508009603885-50cf7c579365?auto=format&fit=crop&w=1200&q=80'),
('Bali',           'Indonesia',    'Southeast Asia',  3200, 94, 'Spiritual island paradise of rice terraces and temples.', NULL),
('Singapore',      'Singapore',    'Southeast Asia',  6500, 93, 'Futuristic city-state with world-class food.', NULL),
('Dubai',          'UAE',          'Middle East',     8000, 95, 'Luxury skyscrapers, desert safaris, and world records.', NULL),
('Paris',          'France',       'Western Europe',  9000, 99, 'City of love, the Eiffel Tower, and haute cuisine.', NULL),
('Rome',           'Italy',        'Southern Europe', 8000, 97, 'Eternal city of Colosseum, Vatican, and gelato.', NULL),
('Barcelona',      'Spain',        'Southern Europe', 7500, 94, 'Gaudi architecture, beaches, and lively streets.', 'https://images.unsplash.com/photo-1583422409516-2895a77efded?auto=format&fit=crop&w=1200&q=80'),
('Amsterdam',      'Netherlands',  'Western Europe',  8500, 90, 'Canals, tulips, and world-class museums.', NULL),
('London',         'UK',           'Western Europe',  10000,98, 'Historic capital with royal heritage and theatre.', NULL),
('New York',       'USA',          'North America',   12000,99, 'The city that never sleeps.', NULL),
('Cancun',         'Mexico',       'Central America', 5500, 88, 'Caribbean beaches, Mayan ruins, and cenotes.', NULL),
('Rio de Janeiro', 'Brazil',       'South America',   5000, 91, 'Carnival, Christ the Redeemer, and Copacabana.', NULL),
('Cape Town',      'South Africa', 'Africa',          6000, 89, 'Table Mountain, wine country, and coastline.', NULL),
('Sydney',         'Australia',    'Oceania',         9500, 93, 'Iconic Opera House, Harbour Bridge, and beaches.', NULL)
ON CONFLICT (name) DO UPDATE SET image_url = EXCLUDED.image_url;

-- ============================================================
--  SEED DATA – Activities Master
-- ============================================================

-- Mumbai (city_id = 1)
INSERT INTO activities_master (city_id, name, category, base_cost, duration_hours, description) VALUES
(1, 'Gateway of India Tour',    'Sightseeing', 200,  2.0, 'Iconic arch monument on the Arabian Sea.'),
(1, 'Elephanta Caves Ferry',    'Culture',     500,  4.0, 'UNESCO heritage cave temples on Elephanta Island.'),
(1, 'Bollywood Studio Tour',    'Culture',     1500, 3.0, 'Behind-the-scenes tour of Bollywood studios.'),
(1, 'Street Food Walk Juhu',    'Food',        400,  2.0, 'Taste vada pav, pani puri, and bhel puri.'),
(1, 'Marine Drive Sunset Walk', 'Sightseeing', 0,    1.0, 'Stroll along the Queen''s Necklace at dusk.'),
(1, 'Dharavi Heritage Tour',    'Culture',     700,  3.0, 'Guided tour of Asia''s largest township.');

-- Delhi (city_id = 2)
INSERT INTO activities_master (city_id, name, category, base_cost, duration_hours, description) VALUES
(2, 'Red Fort Visit',           'Culture',     350,  2.0, 'Mughal-era fort and UNESCO World Heritage Site.'),
(2, 'Qutub Minar Tour',         'Sightseeing', 300,  2.0, 'Tallest brick minaret in the world.'),
(2, 'Chandni Chowk Food Tour',  'Food',        500,  3.0, 'Historic bazaar with parathas and jalebi.'),
(2, 'Humayuns Tomb Visit',      'Culture',     350,  2.0, 'Precursor to the Taj Mahal in lush gardens.'),
(2, 'India Gate Walk',          'Sightseeing', 0,    1.0, 'War memorial on the ceremonial boulevard.'),
(2, 'Akshardham Temple',        'Culture',     300,  3.0, 'Stunning modern temple of architecture.');

-- Jaipur (city_id = 3)
INSERT INTO activities_master (city_id, name, category, base_cost, duration_hours, description) VALUES
(3, 'Amber Fort Tour',          'Culture',     550,  3.0, 'Majestic hilltop fort with elephant rides.'),
(3, 'Hawa Mahal Visit',         'Sightseeing', 200,  1.0, 'Palace of Winds with 953-window facade.'),
(3, 'City Palace Museum',       'Culture',     500,  2.0, 'Royal residence housing museums and galleries.'),
(3, 'Jantar Mantar Visit',      'Sightseeing', 200,  1.0, 'UNESCO-listed astronomical instruments.'),
(3, 'Block Printing Workshop',  'Culture',     800,  2.0, 'Traditional Rajasthani block printing class.'),
(3, 'Johari Bazaar Shopping',   'Shopping',    300,  2.0, 'Gems, textiles, and blue pottery.');

-- Goa (city_id = 4)
INSERT INTO activities_master (city_id, name, category, base_cost, duration_hours, description) VALUES
(4, 'Calangute Beach Day',      'Adventure',   0,    5.0, 'Popular golden beach and water sports hub.'),
(4, 'Dudhsagar Waterfall Trek', 'Adventure',   1200, 6.0, 'Trek to India''s tallest waterfall.'),
(4, 'Old Goa Churches Tour',    'Culture',     200,  2.0, 'UNESCO World Heritage colonial churches.'),
(4, 'Sunset Cruise Mandovi',    'Sightseeing', 800,  2.0, 'Live music dinner cruise on Mandovi River.'),
(4, 'Spice Plantation Tour',    'Culture',     500,  3.0, 'Aromatic Goan spice garden tour.'),
(4, 'Arpora Night Market',      'Food',        300,  3.0, 'Flea market with food and live music.');

-- Bangalore (city_id = 5)
INSERT INTO activities_master (city_id, name, category, base_cost, duration_hours, description) VALUES
(5, 'Lalbagh Botanical Garden', 'Sightseeing', 20,   2.0, '240-acre botanical garden with glass house.'),
(5, 'Cubbon Park Walk',         'Sightseeing', 0,    1.5, 'Central park of Bangalore.'),
(5, 'Bangalore Palace Tour',    'Culture',     230,  1.5, 'Tudor-style royal palace.'),
(5, 'Craft Beer Tour',          'Food',        800,  3.0, 'Visit Bangalore''s famous microbreweries.'),
(5, 'Tipu Sultan Fort',         'Culture',     15,   1.5, '18th-century fort of Tipu Sultan.');

-- Tokyo (city_id = 11)
INSERT INTO activities_master (city_id, name, category, base_cost, duration_hours, description) VALUES
(11, 'Senso-ji Temple Visit',   'Culture',     0,    2.0, 'Tokyo''s oldest and most significant temple.'),
(11, 'Shibuya Crossing',        'Sightseeing', 0,    1.0, 'World''s busiest pedestrian scramble crossing.'),
(11, 'Tsukiji Outer Market',    'Food',        1500, 2.0, 'Fresh sushi, sashimi, and Japanese street food.'),
(11, 'Akihabara District',      'Shopping',    0,    3.0, 'Electric Town for anime, gadgets, and gaming.'),
(11, 'Tokyo Skytree',           'Sightseeing', 2000, 2.0, 'Panoramic views from 634m above Tokyo.'),
(11, 'Mt Fuji Day Trip',        'Adventure',   3500, 10.0,'Iconic volcano hike or scenic bus tour.');

-- Bangkok (city_id = 12)
INSERT INTO activities_master (city_id, name, category, base_cost, duration_hours, description) VALUES
(12, 'Grand Palace Tour',       'Culture',     600,  2.0, 'Dazzling royal palace complex and Wat Phra Kaew.'),
(12, 'Floating Market Tour',    'Food',        1200, 4.0, 'Colorful Damnoen Saduak canal market.'),
(12, 'Wat Arun Temple',         'Culture',     300,  1.0, 'Temple of Dawn on Chao Phraya River.'),
(12, 'Muay Thai Match',         'Adventure',   1500, 3.0, 'Watch live Thai boxing at Lumpinee Stadium.'),
(12, 'Street Food Night Tour',  'Food',        800,  3.0, 'Pad thai, mango sticky rice, and tom yum.'),
(12, 'Chatuchak Market',        'Shopping',    300,  4.0, 'Vast 15,000-stall weekend market.');

-- Bali (city_id = 13)
INSERT INTO activities_master (city_id, name, category, base_cost, duration_hours, description) VALUES
(13, 'Ubud Monkey Forest',      'Sightseeing', 350,  2.0, 'Sacred forest sanctuary with monkeys.'),
(13, 'Tegallalang Rice Terrace','Sightseeing', 200,  2.0, 'UNESCO-recognised subak rice terraces.'),
(13, 'Tanah Lot Sunset',        'Culture',     300,  2.0, 'Sea temple on a rock at sunset.'),
(13, 'Balinese Cooking Class',  'Food',        1500, 3.0, 'Market visit and cook traditional dishes.'),
(13, 'Mount Batur Trek',        'Adventure',   2000, 6.0, 'Pre-dawn climb to an active volcano rim.'),
(13, 'Spa and Jamu Treatment',  'Wellness',    800,  2.0, 'Traditional herbal oil massage and flower bath.');

-- Dubai (city_id = 15)
INSERT INTO activities_master (city_id, name, category, base_cost, duration_hours, description) VALUES
(15, 'Burj Khalifa At the Top', 'Sightseeing', 3500, 2.0, 'Observatory on the world''s tallest building.'),
(15, 'Desert Safari and BBQ',   'Adventure',   4500, 6.0, 'Dune bashing, camel riding, and Bedouin dinner.'),
(15, 'Dubai Mall and Fountain', 'Shopping',    0,    3.0, 'World''s largest mall with dancing fountain.'),
(15, 'Old Dubai Creek Dhow',    'Culture',     2000, 2.0, 'Traditional dhow dinner cruise on the creek.'),
(15, 'Jumeirah Mosque Tour',    'Culture',     500,  1.0, 'Non-Muslim-friendly guided mosque tour.'),
(15, 'Ski Dubai Indoor',        'Adventure',   6000, 3.0, 'Real snow indoor ski resort inside a mall.');

-- Paris (city_id = 16)
INSERT INTO activities_master (city_id, name, category, base_cost, duration_hours, description) VALUES
(16, 'Eiffel Tower Visit',      'Sightseeing', 1800, 2.0, 'Iconic iron lattice tower with city views.'),
(16, 'Louvre Museum',           'Culture',     1700, 4.0, 'World''s largest art museum, home of Mona Lisa.'),
(16, 'Seine River Cruise',      'Sightseeing', 1500, 1.0, 'Romantic boat ride past Notre-Dame.'),
(16, 'Montmartre Walking Tour', 'Culture',     500,  2.0, 'Bohemian hilltop neighbourhood and Sacre-Coeur.'),
(16, 'Versailles Palace Day',   'Culture',     2500, 6.0, 'Opulent palace with Hall of Mirrors and gardens.'),
(16, 'French Patisserie Class', 'Food',        4500, 3.0, 'Bake croissants and eclairs with a Parisian chef.');

-- London (city_id = 20)
INSERT INTO activities_master (city_id, name, category, base_cost, duration_hours, description) VALUES
(20, 'Tower of London Tour',    'Culture',     2200, 2.5, 'Historic castle with Crown Jewels and Beefeaters.'),
(20, 'British Museum Visit',    'Culture',     0,    3.0, 'Free world-class museum with 8 million artifacts.'),
(20, 'Thames River Cruise',     'Sightseeing', 1500, 1.5, 'Scenic cruise past Westminster and Tower Bridge.'),
(20, 'Buckingham Palace',       'Sightseeing', 0,    1.0, 'Royal residence and Changing of the Guard.'),
(20, 'Borough Market Food Tour','Food',        800,  2.0, 'London''s oldest and most famous food market.'),
(20, 'West End Theatre Show',   'Culture',     4000, 3.0, 'World-class musical or play in the West End.');
