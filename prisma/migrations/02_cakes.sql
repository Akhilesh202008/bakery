-- Artisanal Patisserie PostgreSQL Schema Migration
-- Migration 02_cakes.sql

CREATE TABLE IF NOT EXISTS cakes (
    id VARCHAR(36) PRIMARY KEY DEFAULT uuid_generate_v4()::text,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL UNIQUE,
    description TEXT NOT NULL,
    category VARCHAR(100) NOT NULL,
    tag VARCHAR(100),
    tag_type VARCHAR(50) DEFAULT 'bestseller',
    starting_price NUMERIC(10, 2) NOT NULL,
    size_price_note VARCHAR(255),
    sizes JSONB,
    image_url TEXT NOT NULL,
    alt_text VARCHAR(255),
    flavours TEXT[] DEFAULT '{}',
    is_eggless BOOLEAN NOT NULL DEFAULT false,
    dietary_note VARCHAR(100) DEFAULT 'Contains Eggs',
    is_available BOOLEAN NOT NULL DEFAULT true,
    is_featured BOOLEAN NOT NULL DEFAULT false,
    lead_time_hours INT NOT NULL DEFAULT 48,
    customizations TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_cakes_category ON cakes(category);
CREATE INDEX IF NOT EXISTS idx_cakes_is_available ON cakes(is_available);
CREATE INDEX IF NOT EXISTS idx_cakes_is_featured ON cakes(is_featured);
