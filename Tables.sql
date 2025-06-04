-- Пользователи
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    is_admin BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Здания
CREATE TABLE buildings (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    address TEXT NOT NULL,
    owner_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Пожарные датчики
CREATE TABLE sensors (
    id SERIAL PRIMARY KEY,
    building_id INTEGER NOT NULL REFERENCES buildings(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL,           -- smoke, heat, gas и т.д.
    location VARCHAR(100) NOT NULL,      -- например: "1 этаж, коридор"
    installed_at DATE NOT NULL,
    is_active BOOLEAN DEFAULT TRUE
);

-- Инциденты (аварии, срабатывания)
CREATE TABLE incidents (
    id SERIAL PRIMARY KEY,
    sensor_id INTEGER REFERENCES sensors(id) ON DELETE SET NULL,
    detected_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    level VARCHAR(20) NOT NULL,       -- low, medium, high
    description TEXT,
    resolved BOOLEAN DEFAULT FALSE
);

-- Проверки зданий (инспекции)
CREATE TABLE inspections (
    id SERIAL PRIMARY KEY,
    building_id INTEGER NOT NULL REFERENCES buildings(id) ON DELETE CASCADE,
    inspector_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    date DATE NOT NULL,
    notes TEXT,
    passed BOOLEAN NOT NULL
);
