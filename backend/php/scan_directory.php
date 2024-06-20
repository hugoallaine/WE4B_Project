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
    $duration = isset($fileInfo['playtime_seconds']) ? round($fileInfo['playtime_seconds'] / 60, 2) : 0;

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

    $dbFile = dirname(__DIR__) . '/json/files_data.json';
    $db = file_exists($dbFile) ? json_decode(file_get_contents($dbFile), true) : null;

    // Initialize the database if it is empty or malformed
    if (!$db || !is_array($db)) {
        $db = ['artists' => [], 'albums' => [], 'musics' => []];
    }

    $artistsMap = [];
    $albumsMap = [];
    $musicsMap = [];

    // Create a map of existing artists, albums, and musics for faster lookup
    foreach ($db['artists'] as $artist) {
        $artistsMap[$artist['name']] = $artist;
    }

    foreach ($db['albums'] as $album) {
        $albumsMap[$album['title']] = $album;
    }

    foreach ($db['musics'] as $music) {
        $musicsMap[$music['title'] . '|' . $music['filePath']] = $music;
    }

    foreach ($filePaths as $filePath) {

        $metadata = analyzeFile($filePath);

        // Skip adding the music if it already exists in the database
        if (isset($musicsMap[$metadata['title'] . '|' . $metadata['filePath']])) {
            continue;
        }

        // Add the artist if it does not already exist
        if (!isset($artistsMap[$metadata['artist']])) {
            $artistId = count($db['artists']) + 1;
            $newArtist = [
                'id' => $artistId,
                'name' => $metadata['artist'],
            ];
            $db['artists'][] = $newArtist;
            $artistsMap[$metadata['artist']] = $newArtist;
        }

        // Add the album if it does not already exist
        if (!isset($albumsMap[$metadata['album']])) {
            $albumId = count($db['albums']) + 1;
            $newAlbum = [
                'id' => $albumId,
                'title' => $metadata['album'],
                'artist' => $metadata['artist'],
                'coverUrl' => $metadata['coverUrl']
            ];
            $db['albums'][] = $newAlbum;
            $albumsMap[$metadata['album']] = $newAlbum;
        }

        // Use the existing album cover if available
        $metadata['coverUrl'] = $albumsMap[$metadata['album']]['coverUrl'] ?? $metadata['coverUrl'];

        // Add the music
        $db['musics'][] = $metadata;
    }

    file_put_contents($dbFile, json_encode($db, JSON_PRETTY_PRINT));

    echo json_encode(['success' => true, 'message' => 'Directory scanned successfully']);
} else {
    echo json_encode(['error' => 'Invalid request method']);
}
?>
