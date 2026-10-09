<?php

require_once __DIR__ . '/db.php';

$pdo = getDbConnection();
$method = $_SERVER['REQUEST_METHOD'];

$rawInput = file_get_contents('php://input');
$body = json_decode($rawInput, true) ?? $_POST;

if ($method === 'POST') {
    $guestName = $body['dining_guest'] ?? $body['guest_name'] ?? $body['name'] ?? null;
    $phone     = $body['dining_phone'] ?? $body['phone'] ?? null;
    $email     = $body['email'] ?? null;
    $date      = $body['dining_date'] ?? $body['date'] ?? null;
    $time      = $body['dining_time'] ?? $body['time'] ?? '07:30 PM';
    $pax       = strval($body['dining_pax'] ?? $body['guests'] ?? '2');
    $ambiance  = $body['dining_ambiance'] ?? $body['seating_preference'] ?? 'Rainforest Deck';
    $notes     = $body['dining_notes'] ?? $body['special_requests'] ?? '';

    if (!$guestName || !$phone || !$date) {
        sendJsonResponse(['success' => false, 'error' => 'Missing required fields (guest_name, phone, dining_date)'], 400);
    }

    $resNo = 'DINE-' . mt_rand(10000, 99999);

    try {
        $stmt = $pdo->prepare("
            INSERT INTO dining_reservations (
                reservation_no, guest_name, phone, email, reservation_date,
                reservation_time, guest_count, seating_preference, dietary_notes, status
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'Confirmed')
        ");
        $stmt->execute([$resNo, $guestName, $phone, $email, $date, $time, $pax, $ambiance, $notes]);

        sendJsonResponse([
            'success' => true,
            'message' => 'Dining table reservation confirmed in MySQL!',
            'reservation_no' => $resNo,
            'details' => [
                'guest_name' => $guestName,
                'date' => $date,
                'time' => $time,
                'guests' => $pax
            ]
        ], 201);

    } catch (PDOException $e) {
        sendJsonResponse(['success' => false, 'error' => 'Database error: ' . $e->getMessage()], 500);
    }
}

if ($method === 'GET') {
    $stmt = $pdo->query("SELECT * FROM dining_reservations ORDER BY reservation_date DESC, created_at DESC");
    $rows = $stmt->fetchAll();
    sendJsonResponse(['success' => true, 'count' => count($rows), 'reservations' => $rows]);
}
