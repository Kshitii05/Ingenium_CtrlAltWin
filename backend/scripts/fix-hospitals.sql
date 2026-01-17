-- Fix hospitals table for hospital_unique_id migration

USE ingenium_db;

-- Disable foreign key checks
SET FOREIGN_KEY_CHECKS = 0;

-- Drop all related tables
DROP TABLE IF EXISTS hospital_accesses;
DROP TABLE IF EXISTS hospital_access;
DROP TABLE IF EXISTS hospitals;

-- Re-enable foreign key checks
SET FOREIGN_KEY_CHECKS = 1;

-- The server will recreate all tables with correct schema when it starts
