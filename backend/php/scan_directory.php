<?php
require_once 'vendor/autoload.php';
require_once 'vendor/james-heinrich/getid3/getid3/getid3.php';

header("Access-Control-Allow-Origin: http://localhost:4200");
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header('Content-Type: application/json');

function analyzeFile($filePath) {
    $getID3 = new getID3;
    $fileInfo = $getID3->analyze($filePath);

    $title = isset($fileInfo['tags']['id3v2']['title'][0]) ? $fileInfo['tags']['id3v2']['title'][0] : basename($filePath);
    $artist = isset($fileInfo['tags']['id3v2']['artist'][0]) ? $fileInfo['tags']['id3v2']['artist'][0] : 'Unknown Artist';
    $album = isset($fileInfo['tags']['id3v2']['album'][0]) ? $fileInfo['tags']['id3v2']['album'][0] : 'Unknown Album';
    $duration = isset($fileInfo['playtime_seconds']) ? gmdate("i:s", $fileInfo['playtime_seconds']) : "00:00";

    $coverUrl = null;
    if (isset($fileInfo['comments']['picture'][0])) {
        $picture = $fileInfo['comments']['picture'][0];
        $base64Image = base64_encode($picture['data']);
        $coverUrl = 'data:' . $picture['image_mime'] . ';base64,' . $base64Image;
    }

    return [
        'title' => $title,
        'artist' => $artist,
        'album' => $album,
        'duration' => $duration,
        'filePath' => $filePath,
        'coverUrl' => $coverUrl
    ];
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $data = json_decode(file_get_contents('php://input'), true);
    $filePaths = $data['filePaths'] ?? [];

    if (empty($filePaths)) {
        echo json_encode(['error' => 'No files provided']);
        exit;
    }

    $dbFile = dirname(__FILE__) . '/../json/files_data.json';
    $db = file_exists($dbFile) ? json_decode(file_get_contents($dbFile), true) : ['artists' => [], 'albums' => [], 'musics' => []];
    
    foreach ($filePaths as $filePath) {

        $metadata = analyzeFile($filePath);
        $db['musics'][] = $metadata;
    }

    file_put_contents($dbFile, json_encode($db, JSON_PRETTY_PRINT));

    echo json_encode(['success' => true, 'message' => 'Directory scanned successfully','filesPath' => $filePaths,'realPath' => $absoluteFilePath]);
} else {
    echo json_encode(['error' => 'Invalid request method']);
}
?>
