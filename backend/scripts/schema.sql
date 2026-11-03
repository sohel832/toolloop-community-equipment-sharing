-- =======================================================
-- ToolLoop — Community Equipment-Sharing Network
-- Relational Database Schema & Table Definitions (MySQL)
-- =======================================================

CREATE DATABASE IF NOT EXISTS toolloop;
USE toolloop;

-- 1. Users Table
CREATE TABLE IF NOT EXISTS users (
    user_id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL,
    phone VARCHAR(15),
    address VARCHAR(255),
    upi_id VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Communities Table
CREATE TABLE IF NOT EXISTS communities (
    community_id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    type VARCHAR(50) NOT NULL
);

-- 3. User-Community Relationship Table
CREATE TABLE IF NOT EXISTS user_community (
    user_id INT,
    community_id INT,
    joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, community_id),
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (community_id) REFERENCES communities(community_id) ON DELETE CASCADE
);

-- 4. Items / Equipment Table
CREATE TABLE IF NOT EXISTS items (
    item_id INT PRIMARY KEY AUTO_INCREMENT,
    owner_id INT NOT NULL,
    category VARCHAR(50) NOT NULL,
    title VARCHAR(100) NOT NULL,
    description VARCHAR(500),
    item_condition VARCHAR(50),
    rental_rate DECIMAL(10,2) DEFAULT 0,
    deposit_amount DECIMAL(10,2) DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    FOREIGN KEY (owner_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- 5. Availability Schedule Table
CREATE TABLE IF NOT EXISTS availability (
    availability_id INT PRIMARY KEY AUTO_INCREMENT,
    item_id INT NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    status VARCHAR(20) DEFAULT 'available',
    FOREIGN KEY (item_id) REFERENCES items(item_id) ON DELETE CASCADE
);

-- 6. Bookings Table
CREATE TABLE IF NOT EXISTS bookings (
    booking_id INT PRIMARY KEY AUTO_INCREMENT,
    item_id INT NOT NULL,
    borrower_id INT NOT NULL,
    lender_id INT NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    rental_charges DECIMAL(10,2) DEFAULT 0,
    platform_fee DECIMAL(10,2) DEFAULT 20.00,
    deposit_held DECIMAL(10,2) DEFAULT 0,
    total_paid DECIMAL(10,2) DEFAULT 0,
    status VARCHAR(30) DEFAULT 'requested',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (item_id) REFERENCES items(item_id) ON DELETE CASCADE,
    FOREIGN KEY (borrower_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (lender_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- 7. Ratings Table
CREATE TABLE IF NOT EXISTS ratings (
    rating_id INT PRIMARY KEY AUTO_INCREMENT,
    booking_id INT NOT NULL,
    rater_id INT NOT NULL,
    ratee_id INT NOT NULL,
    score INT NOT NULL,
    comment VARCHAR(500),
    FOREIGN KEY (booking_id) REFERENCES bookings(booking_id) ON DELETE CASCADE,
    FOREIGN KEY (rater_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (ratee_id) REFERENCES users(user_id) ON DELETE CASCADE,
    CHECK (score BETWEEN 1 AND 5)
);

-- 8. Payments & Receipts Table
CREATE TABLE IF NOT EXISTS payments (
    payment_id INT PRIMARY KEY AUTO_INCREMENT,
    receipt_number VARCHAR(100) UNIQUE,
    transaction_id VARCHAR(100) UNIQUE,
    booking_id INT NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    rental_charges DECIMAL(10,2) DEFAULT 0,
    platform_fee DECIMAL(10,2) DEFAULT 20.00,
    security_deposit DECIMAL(10,2) DEFAULT 0,
    status VARCHAR(30) DEFAULT 'pending',
    method VARCHAR(50) DEFAULT 'UPI',
    upi_app VARCHAR(50) DEFAULT 'PhonePe',
    upi_ref_id VARCHAR(100),
    payer_upi_id VARCHAR(100),
    payee_upi_id VARCHAR(100),
    razorpay_order_id VARCHAR(100),
    razorpay_payment_id VARCHAR(100),
    razorpay_signature VARCHAR(255),
    refund_status VARCHAR(30) DEFAULT 'none',
    refund_amount DECIMAL(10,2) DEFAULT 0,
    refund_date TIMESTAMP NULL,
    receipt_email VARCHAR(150),
    payment_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (booking_id) REFERENCES bookings(booking_id) ON DELETE CASCADE
);
