<?php
header("Access-Control-Allow-Origin: http://localhost:4200");
header("Access-Control-Allow-Methods: GET");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header('Content-Type: application/json');

$dbFile = dirname(__DIR__) . '/json/files_data.json';
$db = file_exists($dbFile) ? json_decode(file_get_contents($dbFile), true) : null;

if (!$db || !is_array($db)) {
    echo json_encode(['error' => 'Database not found or is malformed']);
    exit;
}

echo json_encode($db);
?>
