<?php
header("Access-Control-Allow-Origin: http://localhost:4200");
header("Access-Control-Allow-Methods: GET");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header('Content-Type: application/json');

/**
 * API to get data
 * 
 * Response:
 * - error (string): the error message
 * - movies (array): the movies list
 * - musics (array): the musics list
 */
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    if (isset($_GET['type'])) {
        if ($_GET['type'] === 'movies') {
            $dbFile = dirname(__DIR__) . '/json/movies.json';
            $db = file_exists($dbFile) ? json_decode(file_get_contents($dbFile), true) : null;
        
            if (!$db || !is_array($db)) {
                echo json_encode(['error' => 'Database not found or is malformed']);
                exit;
            }
        
            echo json_encode($db);
        } else if ($_GET['type'] === 'musics') {
            $dbFile = dirname(__DIR__) . '/json/musics.json';
            $db = file_exists($dbFile) ? json_decode(file_get_contents($dbFile), true) : null;
        
            if (!$db || !is_array($db)) {
                echo json_encode(['error' => 'Database not found or is malformed']);
                exit;
            }
        
            echo json_encode($db);
        } else {
            echo json_encode(['error' => 'Invalid type']);
        }
    }
} else {
    echo json_encode(['error' => 'Invalid request method']);
}

?>