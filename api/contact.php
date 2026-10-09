<?php

require_once __DIR__ . '/db.php';

$pdo = getDbConnection();
$method = $_SERVER['REQUEST_METHOD'];

$rawInput = file_get_contents('php://input');
$body = json_decode($rawInput, true) ?? $_POST;

if ($method === 'POST') {
    $name    = $body['name'] ?? $body['contactName'] ?? null;
    $email   = $body['email'] ?? $body['contactEmail'] ?? null;
    $phone   = $body['phone'] ?? $body['contactPhone'] ?? '';
    $subject = $body['subject'] ?? $body['contactSubject'] ?? 'general';
    $message = $body['message'] ?? $body['contactMsg'] ?? null;

    if (!$name || !$email || !$message) {
        sendJsonResponse(['success' => false, 'error' => 'Missing required fields (name, email, message)'], 400);
    }

    try {
        $stmt = $pdo->prepare("
            INSERT INTO contact_inquiries (name, email, phone, subject, message, status)
            VALUES (?, ?, ?, ?, ?, 'New')
        ");
        $stmt->execute([$name, $email, $phone, $subject, $message]);

        sendJsonResponse([
            'success' => true,
            'message' => 'Your message has been stored in MySQL and forwarded to reception.',
            'id' => $pdo->lastInsertId()
        ], 201);

    } catch (PDOException $e) {
        sendJsonResponse(['success' => false, 'error' => 'Database error: ' . $e->getMessage()], 500);
    }
}

if ($method === 'GET') {
    $stmt = $pdo->query("SELECT * FROM contact_inquiries ORDER BY created_at DESC");
    $rows = $stmt->fetchAll();
    sendJsonResponse(['success' => true, 'count' => count($rows), 'inquiries' => $rows]);
}
