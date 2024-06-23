<?php
require_once dirname(__FILE__) . '/vendor/autoload.php';
require_once dirname(__FILE__) . '/vendor/james-heinrich/getid3/getid3/getid3.php';
require_once dirname(__FILE__) . '/json.php';

header("Access-Control-Allow-Origin: http://localhost:4200");
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header('Content-Type: application/json');

$SPOTIFY_CLIENT_ID = $json['SPOTIFY_CLIENT_ID'];
$SPOTIFY_CLIENT_SECRET = $json['SPOTIFY_CLIENT_SECRET'];

function analyzeFile($filePath)
{
    $getID3 = new getID3;
    $fileInfo = $getID3->analyze($filePath);

    $title = isset($fileInfo['tags']['id3v2']['title'][0]) ? $fileInfo['tags']['id3v2']['title'][0] : basename($filePath);
    $artist = isset($fileInfo['tags']['id3v2']['artist'][0]) ? $fileInfo['tags']['id3v2']['artist'][0] : 'Unknown Artist';
    $album = isset($fileInfo['tags']['id3v2']['album'][0]) ? $fileInfo['tags']['id3v2']['album'][0] : 'Unknown Album';
    $duration = isset($fileInfo['playtime_seconds']) ? round($fileInfo['playtime_seconds'] / 60, 2) : 0;

    $coverUrl = null;
    if (isset($fileInfo['comments']['picture'][0])) {
        $picture = $fileInfo['comments']['picture'][0];
        $imageData = $picture['data'];
        $imageMime = $picture['image_mime'];
        $imageExtension = explode('/', $imageMime)[1];
        $imagePath = 'assets/covers/' . md5($filePath) . '.' . $imageExtension;

        // Path to the covers directory relative to scan_directory.php
        $relativeCoversPath = dirname(dirname(__DIR__)) . '/angular-app/src/' . $imagePath;

        // Create the covers directory if it doesn't exist
        if (!is_dir(dirname(dirname(__DIR__)) . '/angular-app/src/assets/covers')) {
            mkdir(dirname(dirname(__DIR__)) . '/angular-app/src/assets/covers', 0755, true);
        }

        // Save the image file
        file_put_contents($relativeCoversPath, $imageData);

        $coverUrl = $imagePath;
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

function getSpotifyAccessToken($clientId, $clientSecret)
{
    $url = 'https://accounts.spotify.com/api/token';
    $headers = [
        'Authorization: Basic ' . base64_encode($clientId . ':' . $clientSecret),
        'Content-Type: application/x-www-form-urlencoded'
    ];
    $body = 'grant_type=client_credentials';

    $options = [
        'http' => [
            'header' => $headers,
            'method' => 'POST',
            'content' => $body
        ]
    ];
    $context = stream_context_create($options);
    $response = file_get_contents($url, false, $context);

    if ($response === FALSE) {
        error_log("Failed to fetch Spotify access token: " . error_get_last()['message']);
        return null;
    }

    $data = json_decode($response, true);
    return $data['access_token'] ?? null;
}

function getArtistInfoFromSpotify($artistName, $accessToken) {
    $url = 'https://api.spotify.com/v1/search?q=' . urlencode($artistName) . '&type=artist&limit=1';
    $headers = [
        'Authorization: Bearer ' . $accessToken
    ];

    $options = [
        'http' => [
            'header' => $headers
        ]
    ];
    $context = stream_context_create($options);
    $response = file_get_contents($url, false, $context);

    if ($response === FALSE) {
        error_log("Failed to fetch artist info from Spotify for $artistName: " . error_get_last()['message']);
        return null;
    }

    $data = json_decode($response, true);
    if (isset($data['artists']['items'][0])) {
        $artist = $data['artists']['items'][0];
        return [
            'image' => $artist['images'][0]['url'] ?? 'assets/logo/flex-logo-gris.svg',
            'bio' => $artist['genres'][0] ?? '' // Spotify doesn't provide detailed bios, using genres as a placeholder
        ];
    }

    return null;
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    error_log("Received POST request");
    $data = json_decode(file_get_contents('php://input'), true);
    error_log("Received data: " . print_r($data, true));

    $directoryPath = $data['directoryPath'] ?? '';
    error_log("Directory path: " . $directoryPath);

    if (empty($directoryPath)) {
        echo json_encode(['error' => 'No directory path provided']);
        exit;
    }

    $dbFile = dirname(__DIR__) . '/json/musics.json';
    $db = file_exists($dbFile) ? json_decode(file_get_contents($dbFile), true) : null;

    // Initialize the database if it is empty or malformed
    if (!$db || !is_array($db)) {
        $db = ['artists' => []];
    }

    $spotifyAccessToken = getSpotifyAccessToken($SPOTIFY_CLIENT_ID, $SPOTIFY_CLIENT_SECRET);

    // Fetch all files in the given directory recursively
    $allFiles = new RecursiveIteratorIterator(new RecursiveDirectoryIterator($directoryPath));
    $filePaths = [];
    foreach ($allFiles as $file) {
        if ($file->isFile() && in_array(strtolower($file->getExtension()), ['mp3', 'flac', 'wav'])) {
            $filePaths[] = $file->getRealPath();
        }
    }

    foreach ($filePaths as $absoluteFilePath) {
        if ($absoluteFilePath && file_exists($absoluteFilePath)) {
            $metadata = analyzeFile($absoluteFilePath);

            // Find or create the artist
            $artistIndex = null;
            foreach ($db['artists'] as $index => $artist) {
                if ($artist['name'] === $metadata['artist']) {
                    $artistIndex = $index;
                    break;
                }
            }

            if ($artistIndex === null) {
                $artistId = uniqid();
                $artistInfo = $spotifyAccessToken ? getArtistInfoFromSpotify($metadata['artist'], $spotifyAccessToken) : ['image' => 'assets/logo/flex-logo-gris.svg', 'bio' => ''];
                $newArtist = [
                    'id' => $artistId,
                    'name' => $metadata['artist'],
                    'pictureUrl' => $artistInfo['image'],
                    'bio' => $artistInfo['bio'],
                    'albums' => []
                ];
                $db['artists'][] = $newArtist;
                $artistIndex = count($db['artists']) - 1;
            } else {
                $artistId = $db['artists'][$artistIndex]['id'];
            }

            // Find or create the album
            $albumIndex = null;
            foreach ($db['artists'][$artistIndex]['albums'] as $index => $album) {
                if ($album['title'] === $metadata['album']) {
                    $albumIndex = $index;
                    break;
                }
            }

            if ($albumIndex === null) {
                $albumId = uniqid();
                $coverUrl = $metadata['coverUrl'] ?? $db['artists'][$artistIndex]['pictureUrl'] ?? null;
                $newAlbum = [
                    'id' => $albumId,
                    'title' => $metadata['album'],
                    'coverUrl' => $coverUrl,
                    'tracks' => []
                ];
                $db['artists'][$artistIndex]['albums'][] = $newAlbum;
                $albumIndex = count($db['artists'][$artistIndex]['albums']) - 1;
            } else {
                $albumId = $db['artists'][$artistIndex]['albums'][$albumIndex]['id'];
            }

            // Check if the track already exists
            $trackExists = false;
            foreach ($db['artists'][$artistIndex]['albums'][$albumIndex]['tracks'] as $track) {
                if ($track['filePath'] === $metadata['filePath']) {
                    $trackExists = true;
                    break;
                }
            }

            // Add the track if it does not already exist
            if (!$trackExists) {
                $trackId = uniqid();
                $baseAudioPath = 'audio/';
                $db['artists'][$artistIndex]['albums'][$albumIndex]['tracks'][] = [
                    'id' => $trackId,
                    'title' => $metadata['title'],
                    'duration' => $metadata['duration'],
                    'filePath' => $baseAudioPath . basename($metadata['filePath'])
                ];
            }
        } else {
            error_log("File not found: " . $absoluteFilePath);
        }
    }

    file_put_contents($dbFile, json_encode($db, JSON_PRETTY_PRINT));

    echo json_encode(['success' => true, 'message' => 'Directory scanned successfully']);
} else {
    echo json_encode(['error' => 'Invalid request method']);
}
?>
