<?php

require_once __DIR__ . '/db.php';

$pdo = getDbConnection();
$method = $_SERVER['REQUEST_METHOD'];


$rawInput = file_get_contents('php://input');
$body = json_decode($rawInput, true) ?? $_POST;


if (isset($_GET['action'])) {
    if ($_GET['action'] === 'delete') $method = 'DELETE';
    if ($_GET['action'] === 'status') $method = 'PATCH';
}
if (isset($body['_method'])) {
    $method = strtoupper($body['_method']);
}

if ($method === 'POST') {
    $guestName = $body['guest_name'] ?? $body['full_name'] ?? $body['name'] ?? null;
    $email     = $body['email'] ?? $body['guest_email'] ?? null;
    $phone     = $body['phone'] ?? $body['guest_phone'] ?? '';
    $checkIn   = $body['check_in'] ?? $body['modal_check_in'] ?? null;
    $checkOut  = $body['check_out'] ?? $body['modal_check_out'] ?? null;
    $rawRoom   = $body['room_type'] ?? $body['modal_room_type'] ?? 'Deluxe Forest Chalet';
    $guests    = intval($body['guests'] ?? $body['modal_guests'] ?? 2);
    $mealPlan  = $body['meal_plan'] ?? $body['modal_meal_plan'] ?? 'bb';
    $notes     = $body['special_requests'] ?? $body['notes'] ?? '';

    if (!$guestName || !$email || !$checkIn || !$checkOut) {
        sendJsonResponse(['success' => false, 'error' => 'Missing required fields (guest_name, email, check_in, check_out)'], 400);
    }

    $roomMap = [
        '160' => 'Deluxe Forest Chalet',
        'deluxe' => 'Deluxe Forest Chalet',
        'deluxe-forest' => 'Deluxe Forest Chalet',
        '220' => 'River View Pavilion',
        'river' => 'River View Pavilion',
        'river-pavilion' => 'River View Pavilion',
        '310' => 'Royal Canopy Honeymoon Suite',
        'canopy' => 'Royal Canopy Honeymoon Suite',
        'canopy-suite' => 'Royal Canopy Honeymoon Suite',
        '380' => 'Family Nature Lodge',
        'family-lodge' => 'Family Nature Lodge'
    ];
    $cleanRoomKey = strtolower(trim($rawRoom));
    $roomType = $roomMap[$cleanRoomKey] ?? $rawRoom;

    // Nights calculation
    $dIn = new DateTime($checkIn);
    $dOut = new DateTime($checkOut);
    $diff = $dIn->diff($dOut);
    $nights = max(1, $diff->days);

    // Total price calculation
    $rawPrice = preg_replace('/[^0-9.]/', '', strval($body['total_price'] ?? $body['total_amount'] ?? '0'));
    $totalPrice = floatval($rawPrice);

    if ($totalPrice <= 0) {
        $rates = [
            'Deluxe Forest Chalet' => 160,
            'River View Pavilion' => 220,
            'Royal Canopy Honeymoon Suite' => 310,
            'Family Nature Lodge' => 380
        ];
        $rate = $rates[$roomType] ?? 160;
        $totalPrice = $rate * $nights;
    }

    $refNo = 'SND-' . mt_rand(100000, 999999);

    try {
        $stmt = $pdo->prepare("
            INSERT INTO bookings (
                reference_no, guest_name, email, phone, room_type,
                check_in, check_out, nights, guests, meal_plan,
                special_requests, total_price, status
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Confirmed')
        ");
        $stmt->execute([
            $refNo, $guestName, $email, $phone, $roomType,
            $checkIn, $checkOut, $nights, $guests, $mealPlan,
            $notes, $totalPrice
        ]);
        $bookingId = $pdo->lastInsertId();

        sendJsonResponse([
            'success' => true,
            'message' => 'Reservation successfully saved to MySQL database via PHP!',
            'reference_no' => $refNo,
            'booking' => [
                'id' => $bookingId,
                'reference_no' => $refNo,
                'guest_name' => $guestName,
                'email' => $email,
                'room_type' => $roomType,
                'check_in' => $checkIn,
                'check_out' => $checkOut,
                'nights' => $nights,
                'guests' => $guests,
                'meal_plan' => $mealPlan,
                'total_price' => '$' . number_format($totalPrice, 2),
                'status' => 'Confirmed'
            ]
        ], 201);

    } catch (PDOException $e) {
        sendJsonResponse(['success' => false, 'error' => 'Database error: ' . $e->getMessage()], 500);
    }
}

if ($method === 'GET') {
    
    if (isset($_GET['ref'])) {
        $stmt = $pdo->prepare("SELECT * FROM bookings WHERE reference_no = ? LIMIT 1");
        $stmt->execute([$_GET['ref']]);
        $booking = $stmt->fetch();
        if (!$booking) sendJsonResponse(['success' => false, 'error' => 'Booking not found'], 404);
        sendJsonResponse(['success' => true, 'booking' => $booking]);
    }

    if (isset($_GET['id'])) {
        $stmt = $pdo->prepare("SELECT * FROM bookings WHERE id = ? LIMIT 1");
        $stmt->execute([intval($_GET['id'])]);
        $booking = $stmt->fetch();
        if (!$booking) sendJsonResponse(['success' => false, 'error' => 'Booking not found'], 404);
        sendJsonResponse(['success' => true, 'booking' => $booking]);
    }

    $status = $_GET['status'] ?? 'all';
    $search = $_GET['search'] ?? '';

    $sql = "SELECT * FROM bookings WHERE 1=1";
    $params = [];

    if ($status !== 'all' && !empty($status)) {
        $sql .= " AND status = ?";
        $params[] = $status;
    }

    if (!empty($search)) {
        $sql .= " AND (reference_no LIKE ? OR guest_name LIKE ? OR email LIKE ?)";
        $searchParam = "%$search%";
        $params[] = $searchParam;
        $params[] = $searchParam;
        $params[] = $searchParam;
    }

    $sql .= " ORDER BY created_at DESC";

    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);
    $bookings = $stmt->fetchAll();

    sendJsonResponse([
        'success' => true,
        'count' => count($bookings),
        'bookings' => $bookings
    ]);
}

if ($method === 'PATCH') {
    $id = intval($_GET['id'] ?? $body['id'] ?? 0);
    $newStatus = $body['status'] ?? '';

    if (!$id || !in_array($newStatus, ['Confirmed', 'Pending', 'Cancelled'])) {
        sendJsonResponse(['success' => false, 'error' => 'Valid ID and status (Confirmed, Pending, Cancelled) required'], 400);
    }

    $stmt = $pdo->prepare("UPDATE bookings SET status = ? WHERE id = ?");
    $stmt->execute([$newStatus, $id]);

    sendJsonResponse(['success' => true, 'message' => "Booking #$id status updated to $newStatus"]);
}

if ($method === 'DELETE') {
    $id = intval($_GET['id'] ?? $body['id'] ?? 0);

    if (!$id) {
        sendJsonResponse(['success' => false, 'error' => 'Valid booking ID required'], 400);
    }

    $stmt = $pdo->prepare("DELETE FROM bookings WHERE id = ?");
    $stmt->execute([$id]);

    sendJsonResponse(['success' => true, 'message' => "Booking #$id deleted successfully"]);
}
