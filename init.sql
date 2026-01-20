-- Database initialization script for MH Logistics System
-- This script creates the initial database and user

-- Create database (will be created by PostgreSQL container)
-- CREATE DATABASE mh_database;

-- Create user and grant permissions
-- CREATE USER mh_user WITH ENCRYPTED PASSWORD 'your_secure_password_here';
-- GRANT ALL PRIVILEGES ON DATABASE mh_database TO mh_user;

-- Connect to the database
-- \c mh_database;

-- Grant schema permissions
-- GRANT ALL ON SCHEMA public TO mh_user;
-- GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO mh_user;
-- GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO mh_user;

-- Set default permissions for future tables
-- ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO mh_user;
-- ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO mh_user;

-- Note: This script is mainly for documentation. 
-- The actual database and user will be created by Docker Compose environment variables.