-- Public Food Surplus Distribution System Database Schema
-- MySQL Database Schema with Sample Data

CREATE DATABASE IF NOT EXISTS food_surplus_db;
USE food_surplus_db;

-- Users table with roles and location data
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('donor', 'beneficiary', 'admin') NOT NULL,
    phone VARCHAR(20),
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    address TEXT,
    verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Food items table for surplus food listings
CREATE TABLE food_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    donor_id INT NOT NULL,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    quantity INT NOT NULL,
    unit VARCHAR(50) DEFAULT 'servings',
    expiry_date DATETIME,
    pickup_start DATETIME NOT NULL,
    pickup_end DATETIME NOT NULL,
    location VARCHAR(255),
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    image_url VARCHAR(500),
    status ENUM('available', 'requested', 'accepted', 'picked', 'completed', 'cancelled') DEFAULT 'available',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (donor_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_status (status),
    INDEX idx_location (latitude, longitude),
    INDEX idx_donor (donor_id)
);

-- Pickup requests table for managing food pickup requests
CREATE TABLE pickup_requests (
    id INT AUTO_INCREMENT PRIMARY KEY,
    food_item_id INT NOT NULL,
    beneficiary_id INT NOT NULL,
    status ENUM('pending', 'accepted', 'rejected', 'picked', 'completed', 'cancelled') DEFAULT 'pending',
    message TEXT,
    requested_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    responded_at TIMESTAMP NULL,
    picked_at TIMESTAMP NULL,
    completed_at TIMESTAMP NULL,
    FOREIGN KEY (food_item_id) REFERENCES food_items(id) ON DELETE CASCADE,
    FOREIGN KEY (beneficiary_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_food_item (food_item_id),
    INDEX idx_beneficiary (beneficiary_id),
    INDEX idx_status (status)
);

-- Notifications table for user notifications
CREATE TABLE notifications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    type ENUM('new_listing', 'pickup_request', 'request_accepted', 'request_rejected', 'pickup_completed') NOT NULL,
    title VARCHAR(200) NOT NULL,
    message TEXT NOT NULL,
    payload JSON,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_read (user_id, is_read),
    INDEX idx_created (created_at)
);

-- Verification requests table for organization verification
CREATE TABLE verification_requests (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    organization_name VARCHAR(200),
    organization_type ENUM('restaurant', 'ngo', 'shelter', 'food_bank', 'other') NOT NULL,
    document_url VARCHAR(500),
    description TEXT,
    status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
    admin_notes TEXT,
    submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    reviewed_at TIMESTAMP NULL,
    reviewed_by INT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (reviewed_by) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_user (user_id),
    INDEX idx_status (status)
);

-- Sample Data Inserts

-- Insert sample users (passwords are hashed for 'password123')
INSERT INTO users (name, email, password_hash, role, phone, latitude, longitude, address, verified) VALUES
-- Admin user
('System Admin', 'admin@foodsurplus.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBcQoi0l7JOIyS', 'admin', '+1234567890', 40.7128, -74.0060, '123 Admin St, New York, NY', TRUE),

-- Donor users (restaurants and households)
('Mario\'s Italian Restaurant', 'mario@restaurant.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBcQoi0l7JOIyS', 'donor', '+1234567891', 40.7589, -73.9851, '456 Restaurant Ave, New York, NY', TRUE),
('Green Valley Cafe', 'info@greenvalley.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBcQoi0l7JOIyS', 'donor', '+1234567892', 40.7505, -73.9934, '789 Cafe Blvd, New York, NY', TRUE),
('John Smith (Household)', 'john.smith@email.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBcQoi0l7JOIyS', 'donor', '+1234567893', 40.7282, -73.7949, '321 Home St, Queens, NY', FALSE),

-- Beneficiary users (NGOs, shelters, individuals)
('Hope Shelter NYC', 'contact@hopeshelter.org', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBcQoi0l7JOIyS', 'beneficiary', '+1234567894', 40.7831, -73.9712, '654 Shelter St, New York, NY', TRUE),
('Community Food Bank', 'help@communityfb.org', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBcQoi0l7JOIyS', 'beneficiary', '+1234567895', 40.7614, -73.9776, '987 Food Bank Ave, New York, NY', TRUE),
('Sarah Johnson (Individual)', 'sarah.j@email.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBcQoi0l7JOIyS', 'beneficiary', '+1234567896', 40.7749, -73.9442, '159 Individual St, New York, NY', FALSE);

-- Insert sample food items
INSERT INTO food_items (donor_id, title, description, quantity, unit, expiry_date, pickup_start, pickup_end, location, latitude, longitude, status) VALUES
(2, 'Fresh Pasta and Marinara Sauce', 'Leftover pasta from lunch service, enough for 20 people', 20, 'servings', '2024-10-03 22:00:00', '2024-10-02 18:00:00', '2024-10-02 21:00:00', 'Mario\'s Italian Restaurant', 40.7589, -73.9851, 'available'),
(3, 'Vegetarian Sandwiches', 'Assorted vegetarian sandwiches, freshly made', 15, 'pieces', '2024-10-03 12:00:00', '2024-10-02 16:00:00', '2024-10-02 20:00:00', 'Green Valley Cafe', 40.7505, -73.9934, 'available'),
(4, 'Home-cooked Curry and Rice', 'Made too much curry for family dinner', 8, 'servings', '2024-10-04 20:00:00', '2024-10-02 19:00:00', '2024-10-02 22:00:00', 'John\'s Home', 40.7282, -73.7949, 'available'),
(2, 'Bread and Pastries', 'End of day bakery items, still fresh', 30, 'pieces', '2024-10-03 08:00:00', '2024-10-02 20:00:00', '2024-10-02 23:00:00', 'Mario\'s Italian Restaurant', 40.7589, -73.9851, 'requested');

-- Insert sample pickup requests
INSERT INTO pickup_requests (food_item_id, beneficiary_id, status, message, requested_at) VALUES
(4, 5, 'pending', 'We can pick this up for our evening meal service. Thank you!', '2024-10-02 19:30:00'),
(1, 6, 'pending', 'This would be perfect for our food distribution program.', '2024-10-02 19:45:00');

-- Insert sample notifications
INSERT INTO notifications (user_id, type, title, message, payload, is_read) VALUES
(5, 'new_listing', 'New Food Available Nearby', 'Fresh Pasta and Marinara Sauce available for pickup', '{"food_item_id": 1, "distance": "0.8 km"}', FALSE),
(6, 'new_listing', 'New Food Available Nearby', 'Vegetarian Sandwiches available for pickup', '{"food_item_id": 2, "distance": "1.2 km"}', FALSE),
(2, 'pickup_request', 'New Pickup Request', 'Hope Shelter NYC requested pickup for Bread and Pastries', '{"request_id": 1, "beneficiary": "Hope Shelter NYC"}', FALSE);

-- Insert sample verification requests
INSERT INTO verification_requests (user_id, organization_name, organization_type, description, status) VALUES
(5, 'Hope Shelter NYC', 'shelter', 'We are a registered non-profit shelter serving homeless individuals in NYC', 'approved'),
(6, 'Community Food Bank', 'food_bank', 'Community food bank serving low-income families', 'approved');

-- Create indexes for better performance
CREATE INDEX idx_users_location ON users(latitude, longitude);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_food_items_expiry ON food_items(expiry_date);
CREATE INDEX idx_notifications_created ON notifications(created_at DESC);
