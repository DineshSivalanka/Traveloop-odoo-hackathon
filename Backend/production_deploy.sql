-- ============================================================
-- TRAVELOOP PRODUCTION DATABASE EXPORT
-- ============================================================

-- 1. Create Tables
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100),
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS trips (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    start_date DATE,
    end_date DATE,
    budget DECIMAL(12, 2) DEFAULT 0,
    cover_image_url TEXT,
    is_public BOOLEAN DEFAULT FALSE,
    share_token VARCHAR(100) UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS cities (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    country VARCHAR(100),
    region VARCHAR(100),
    cost_index INTEGER,
    popularity INTEGER,
    description TEXT,
    image_url TEXT
);

CREATE TABLE IF NOT EXISTS trip_stops (
    id SERIAL PRIMARY KEY,
    trip_id INTEGER REFERENCES trips(id) ON DELETE CASCADE,
    city_name VARCHAR(100),
    city_id INTEGER REFERENCES cities(id) ON DELETE SET NULL,
    arrival_date DATE,
    departure_date DATE,
    stop_order INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS activities_master (
    id SERIAL PRIMARY KEY,
    city_id INTEGER REFERENCES cities(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    category VARCHAR(50),
    base_cost DECIMAL(10, 2),
    duration_hours DECIMAL(4, 2),
    description TEXT
);

CREATE TABLE IF NOT EXISTS activities (
    id SERIAL PRIMARY KEY,
    stop_id INTEGER REFERENCES trip_stops(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    category VARCHAR(50),
    estimated_cost DECIMAL(10, 2),
    scheduled_at TIMESTAMP,
    duration_hours DECIMAL(4, 2),
    note TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS trip_notes (
    id SERIAL PRIMARY KEY,
    trip_id INTEGER REFERENCES trips(id) ON DELETE CASCADE,
    stop_id INTEGER REFERENCES trip_stops(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Seed Cities with Imagery
INSERT INTO cities (name, country, region, cost_index, popularity, description, image_url) VALUES
('Mumbai',         'India',        'South Asia',      2500, 95, 'Financial capital of India with iconic landmarks.', 'https://images.unsplash.com/photo-1566552881560-0be862a7c445'),
('Delhi',          'India',        'South Asia',      2200, 92, 'India''s capital with historic Mughal architecture.', 'https://images.unsplash.com/photo-1587474260584-1f3c8b44379f'),
('Jaipur',         'India',        'South Asia',      1800, 88, 'The Pink City, gateway to Rajasthan.', 'https://images.unsplash.com/photo-1599661046289-e31897846e41'),
('Goa',            'India',        'South Asia',      2800, 90, 'Tropical beaches, seafood, and vibrant nightlife.', 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2'),
('Bangalore',      'India',        'South Asia',      2600, 85, 'Silicon Valley of India with a cool climate.', 'https://images.unsplash.com/photo-1596176530529-78163a4f7af2'),
('Tokyo',          'Japan',        'East Asia',       7500, 98, 'Ultra-modern metropolis blending tradition and innovation.', 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf'),
('Bangkok',        'Thailand',     'Southeast Asia',  3500, 96, 'Vibrant street life, temples, and floating markets.', 'https://images.unsplash.com/photo-1525625239514-75b4b174ef91'),
('Bali',           'Indonesia',    'Southeast Asia',  3200, 94, 'Spiritual island paradise of rice terraces and temples.', 'https://images.unsplash.com/photo-1537996194471-e657df975ab4'),
('Singapore',      'Singapore',    'Southeast Asia',  6500, 93, 'Futuristic city-state with world-class food.', 'https://images.unsplash.com/photo-1525596662741-e94ff9f26de1'),
('Dubai',          'UAE',          'Middle East',     8000, 95, 'Luxury skyscrapers, desert safaris, and world records.', 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c'),
('Paris',          'France',       'Western Europe',  9000, 99, 'City of love, the Eiffel Tower, and haute cuisine.', 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34'),
('Rome',           'Italy',        'Southern Europe', 8000, 97, 'Eternal city of Colosseum, Vatican, and gelato.', 'https://images.unsplash.com/photo-1552832230-c0197dd311b5'),
('London',         'UK',           'Western Europe',  10000,98, 'Historic capital with royal heritage and theatre.', 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad'),
('New York',       'USA',          'North America',   12000,99, 'The city that never sleeps.', 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9'),
('Sydney',         'Australia',    'Oceania',         9500, 93, 'Iconic Opera House, Harbour Bridge, and beaches.', 'https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9')
ON CONFLICT (name) DO NOTHING;

-- 3. Seed Master Activities (Example for Tokyo)
INSERT INTO activities_master (city_id, name, category, base_cost, duration_hours, description)
SELECT id, 'Senso-ji Temple Visit', 'Culture', 0, 2.0, 'Tokyo''s oldest temple.' FROM cities WHERE name = 'Tokyo';
INSERT INTO activities_master (city_id, name, category, base_cost, duration_hours, description)
SELECT id, 'Shibuya Crossing', 'Sightseeing', 0, 1.0, 'World''s busiest crossing.' FROM cities WHERE name = 'Tokyo';
INSERT INTO activities_master (city_id, name, category, base_cost, duration_hours, description)
SELECT id, 'Akihabara District', 'Shopping', 0, 3.0, 'Electric Town for anime and gaming.' FROM cities WHERE name = 'Tokyo';
