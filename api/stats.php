<?php

require_once __DIR__ . '/db.php';

$pdo = getDbConnection();

try {
    $stmt1 = $pdo->query("
        SELECT 
            COUNT(*) AS total_bookings,
            SUM(CASE WHEN status = 'Confirmed' THEN 1 ELSE 0 END) AS confirmed_bookings,
            SUM(CASE WHEN status = 'Pending' THEN 1 ELSE 0 END) AS pending_bookings,
            SUM(CASE WHEN status = 'Cancelled' THEN 1 ELSE 0 END) AS cancelled_bookings,
            COALESCE(SUM(CASE WHEN status != 'Cancelled' THEN total_price ELSE 0 END), 0) AS total_revenue
        FROM bookings
    ");
    $bStats = $stmt1->fetch();

    $stmt2 = $pdo->query("SELECT COUNT(*) AS total_dining FROM dining_reservations");
    $dStats = $stmt2->fetch();

    $stmt3 = $pdo->query("SELECT COUNT(*) AS total_inquiries FROM contact_inquiries");
    $cStats = $stmt3->fetch();

    sendJsonResponse([
        'success' => true,
        'database_connected' => true,
        'stats' => [
            'total_bookings' => intval($bStats['total_bookings'] ?? 0),
            'confirmed_bookings' => intval($bStats['confirmed_bookings'] ?? 0),
            'pending_bookings' => intval($bStats['pending_bookings'] ?? 0),
            'cancelled_bookings' => intval($bStats['cancelled_bookings'] ?? 0),
            'total_revenue' => floatval($bStats['total_revenue'] ?? 0),
            'total_dining' => intval($dStats['total_dining'] ?? 0),
            'total_inquiries' => intval($cStats['total_inquiries'] ?? 0)
        ]
    ]);

} catch (PDOException $e) {
    sendJsonResponse(['success' => false, 'error' => $e->getMessage()], 500);
}
