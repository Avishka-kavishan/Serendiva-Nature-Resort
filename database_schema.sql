-- ===================================================================
-- Serendiva Nature Resort - MySQL 8.0 Database Schema
-- Database: serendiva_resort
-- ===================================================================

CREATE DATABASE IF NOT EXISTS serendiva_resort
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE serendiva_resort;

-- -------------------------------------------------------------------
-- 1. Room Reservations Table
-- -------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS bookings (
  id INT AUTO_INCREMENT PRIMARY KEY,
  reference_no VARCHAR(20) NOT NULL UNIQUE,
  guest_name VARCHAR(120) NOT NULL,
  email VARCHAR(120) NOT NULL,
  phone VARCHAR(40) DEFAULT NULL,
  room_type VARCHAR(120) NOT NULL,
  check_in DATE NOT NULL,
  check_out DATE NOT NULL,
  nights INT NOT NULL DEFAULT 1,
  guests INT NOT NULL DEFAULT 2,
  meal_plan VARCHAR(80) DEFAULT 'bb',
  special_requests TEXT DEFAULT NULL,
  total_price DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
  status ENUM('Confirmed', 'Pending', 'Cancelled') NOT NULL DEFAULT 'Confirmed',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_reference (reference_no),
  INDEX idx_check_in (check_in),
  INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- -------------------------------------------------------------------
-- 2. Restaurant & Dining Reservations Table
-- -------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS dining_reservations (
  id INT AUTO_INCREMENT PRIMARY KEY,
  reservation_no VARCHAR(20) NOT NULL UNIQUE,
  guest_name VARCHAR(120) NOT NULL,
  phone VARCHAR(40) NOT NULL,
  email VARCHAR(120) DEFAULT NULL,
  reservation_date DATE NOT NULL,
  reservation_time VARCHAR(30) NOT NULL,
  guest_count VARCHAR(20) NOT NULL DEFAULT '2',
  seating_preference VARCHAR(100) DEFAULT 'Rainforest Deck',
  dietary_notes TEXT DEFAULT NULL,
  status ENUM('Confirmed', 'Pending', 'Cancelled') NOT NULL DEFAULT 'Confirmed',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_dining_res (reservation_no),
  INDEX idx_dining_date (reservation_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- -------------------------------------------------------------------
-- 3. Contact Inquiries & Concierge Messages Table
-- -------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS contact_inquiries (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(120) NOT NULL,
  email VARCHAR(120) NOT NULL,
  phone VARCHAR(40) DEFAULT NULL,
  subject VARCHAR(100) DEFAULT 'general',
  message TEXT NOT NULL,
  status ENUM('New', 'Replied', 'Archived') NOT NULL DEFAULT 'New',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- -------------------------------------------------------------------
-- Sample Seed Data for Demonstration & Testing
-- -------------------------------------------------------------------
INSERT INTO bookings (reference_no, guest_name, email, phone, room_type, check_in, check_out, nights, guests, meal_plan, special_requests, total_price, status)
VALUES
  ('SND-104921', 'Sarah Jenkins', 'sarah.jenkins@example.com', '+44 7700 900123', 'Deluxe Forest Chalet', DATE_ADD(CURDATE(), INTERVAL 3 DAY), DATE_ADD(CURDATE(), INTERVAL 6 DAY), 3, 2, 'bb', 'Quiet chalets near tea terrace preferred', 480.00, 'Confirmed'),
  ('SND-284910', 'Hiroshi Tanaka', 'hiroshi.t@example.jp', '+81 90 1234 5678', 'Royal Canopy Honeymoon Suite', DATE_ADD(CURDATE(), INTERVAL 7 DAY), DATE_ADD(CURDATE(), INTERVAL 11 DAY), 4, 2, 'fb', 'Honeymoon arrangement with floral bath', 1240.00, 'Confirmed'),
  ('SND-392817', 'Emma Watson', 'emma.watson@example.co.uk', '+44 7911 123456', 'River View Pavilion', DATE_ADD(CURDATE(), INTERVAL 10 DAY), DATE_ADD(CURDATE(), INTERVAL 12 DAY), 2, 2, 'hb', 'Late check-in around 8 PM', 440.00, 'Pending')
ON DUPLICATE KEY UPDATE reference_no = reference_no;

INSERT INTO dining_reservations (reservation_no, guest_name, phone, email, reservation_date, reservation_time, guest_count, seating_preference, dietary_notes, status)
VALUES
  ('DINE-83910', 'Michael Chang', '+65 9123 4567', 'mchang@example.com', DATE_ADD(CURDATE(), INTERVAL 1 DAY), '07:30 PM', '2', 'Private Candlelit Garden Table', 'Gluten-free requirements for one guest', 'Confirmed')
ON DUPLICATE KEY UPDATE reservation_no = reservation_no;

INSERT INTO contact_inquiries (name, email, phone, subject, message, status)
VALUES
  ('David Miller', 'david.miller@example.com', '+94 77 123 4567', 'transport', 'Could you arrange an electric SUV transfer from Ella Railway Station on arrival?', 'New')
ON DUPLICATE KEY UPDATE email = email;
