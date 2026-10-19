-- Artisanal Patisserie PostgreSQL Schema Migration
-- Migration 01_init.sql

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Users Table
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(36) PRIMARY KEY DEFAULT uuid_generate_v4()::text,
    email VARCHAR(255) NOT NULL UNIQUE,
    name VARCHAR(255) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL DEFAULT 'CONCIERGE',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Customer Profiles Table
CREATE TABLE IF NOT EXISTS customer_profiles (
    id VARCHAR(36) PRIMARY KEY DEFAULT uuid_generate_v4()::text,
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(255),
    notes TEXT,
    total_inquiries INT NOT NULL DEFAULT 1,
    last_inquiry_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_customer_profiles_phone ON customer_profiles(phone);

-- 3. Inquiries Table
CREATE TABLE IF NOT EXISTS inquiries (
    id VARCHAR(36) PRIMARY KEY DEFAULT uuid_generate_v4()::text,
    reference_code VARCHAR(50) NOT NULL UNIQUE,
    client_name VARCHAR(255) NOT NULL,
    phone VARCHAR(50) NOT NULL,
    email VARCHAR(255),
    occasion VARCHAR(255) NOT NULL,
    flavour_profile VARCHAR(255) NOT NULL,
    guest_count VARCHAR(255) NOT NULL,
    event_date DATE NOT NULL,
    design_notes TEXT,
    status VARCHAR(50) NOT NULL DEFAULT 'NEW',
    internal_notes TEXT,
    estimated_price NUMERIC(10, 2),
    whatsapp_sent BOOLEAN NOT NULL DEFAULT false,
    customer_id VARCHAR(36) REFERENCES customer_profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_inquiries_ref ON inquiries(reference_code);
CREATE INDEX IF NOT EXISTS idx_inquiries_phone ON inquiries(phone);
CREATE INDEX IF NOT EXISTS idx_inquiries_status ON inquiries(status);
CREATE INDEX IF NOT EXISTS idx_inquiries_event_date ON inquiries(event_date);
CREATE INDEX IF NOT EXISTS idx_inquiries_created_at ON inquiries(created_at DESC);

-- 4. Message Logs Table
CREATE TABLE IF NOT EXISTS message_logs (
    id VARCHAR(36) PRIMARY KEY DEFAULT uuid_generate_v4()::text,
    inquiry_id VARCHAR(36) REFERENCES inquiries(id) ON DELETE CASCADE,
    direction VARCHAR(20) NOT NULL DEFAULT 'OUTBOUND',
    channel VARCHAR(50) NOT NULL DEFAULT 'WHATSAPP_CLOUD_API',
    recipient_phone VARCHAR(50) NOT NULL,
    sender_phone VARCHAR(50),
    message_content TEXT NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'SENT',
    meta_message_id VARCHAR(255),
    error_payload TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_message_logs_inquiry_id ON message_logs(inquiry_id);
CREATE INDEX IF NOT EXISTS idx_message_logs_recipient ON message_logs(recipient_phone);
CREATE INDEX IF NOT EXISTS idx_message_logs_meta_id ON message_logs(meta_message_id);

-- 5. Audit Logs Table
CREATE TABLE IF NOT EXISTS audit_logs (
    id VARCHAR(36) PRIMARY KEY DEFAULT uuid_generate_v4()::text,
    entity VARCHAR(100) NOT NULL,
    entity_id VARCHAR(255) NOT NULL,
    action VARCHAR(100) NOT NULL,
    performed_by VARCHAR(36) REFERENCES users(id) ON DELETE SET NULL,
    details TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_audit_logs_entity ON audit_logs(entity, entity_id);
