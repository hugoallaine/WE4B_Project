<?php
require_once dirname(__FILE__).'/vendor/autoload.php';
require_once dirname(__FILE__).'/json.php';

header("Access-Control-Allow-Origin: http://localhost:4200");
header("Access-Control-Allow-Methods: GET");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header('Content-Type: application/json');

if (isset($_GET['albumId'])) {
    $albumId = intval($_GET['albumId']);
    $dbFile = dirname(__DIR__) . '/json/files_data.json';
    $db = file_exists($dbFile) ? json_decode(file_get_contents($dbFile), true) : null;

    if ($db && is_array($db)) {
        foreach ($db['albums'] as $album) {
            if ($album['id'] === $albumId) {
                echo json_encode(['album' => $album]);
                exit;
            }
        }
    }
    echo json_encode(['error' => 'Album not found']);
} else {
    echo json_encode(['error' => 'Invalid request method']);
}
?>
