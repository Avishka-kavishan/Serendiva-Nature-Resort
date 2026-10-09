<?php

define('DB_HOST', 'localhost');
define('DB_PORT', '3306');
define('DB_USER', 'root');

// Enter your MySQL 8.0 root password below:
define('DB_PASS', 'root123');

define('DB_NAME', 'serendiva_resort');

function sendJsonResponse($data, $statusCode = 200) {
    http_response_code($statusCode);
    header('Content-Type: application/json; charset=utf-8');
    header('Access-Control-Allow-Origin: *');
    header('Access-Control-Allow-Methods: GET, POST, PATCH, DELETE, OPTIONS');
    header('Access-Control-Allow-Headers: Content-Type, Authorization');
    echo json_encode($data, JSON_PRETTY_PRINT);
    exit;
}

// Handle CORS Pre-flight request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    header('Access-Control-Allow-Origin: *');
    header('Access-Control-Allow-Methods: GET, POST, PATCH, DELETE, OPTIONS');
    header('Access-Control-Allow-Headers: Content-Type, Authorization');
    http_response_code(200);
    exit;
}
