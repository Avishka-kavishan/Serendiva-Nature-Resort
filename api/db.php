<?php

require_once __DIR__ . '/config.php';

function getDbConnection() {
    static $pdo = null;

    if ($pdo !== null) {
        return $pdo;
    }

    try {
        // Step 1: Connect to MySQL server without database first to ensure DB exists
        $serverDsn = "mysql:host=" . DB_HOST . ";port=" . DB_PORT . ";charset=utf8mb4";
        $serverPdo = new PDO($serverDsn, DB_USER, DB_PASS, [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC
        ]);

        $serverPdo->exec("CREATE DATABASE IF NOT EXISTS `" . DB_NAME . "` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;");

        // Step 2: Connect to the specific database
        $dbDsn = "mysql:host=" . DB_HOST . ";port=" . DB_PORT . ";dbname=" . DB_NAME . ";charset=utf8mb4";
        $pdo = new PDO($dbDsn, DB_USER, DB_PASS, [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC
        ]);

        // Step 3: Ensure tables exist
        $pdo->exec("
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
        ");

        return $pdo;

    } catch (PDOException $e) {
        $errorCode = $e->getCode();
        $errorMsg = $e->getMessage();

        if (strpos($errorMsg, 'Access denied') !== false) {
            sendJsonResponse([
                'success' => false,
                'error' => "MySQL Access Denied for user '" . DB_USER . "'. Please update your DB_PASS in 'api/config.php'."
            ], 500);
        }

        sendJsonResponse([
            'success' => false,
            'error' => "Database Connection Error: " . $errorMsg
        ], 500);
    }
}
