<?php
require_once dirname(__FILE__).'/vendor/autoload.php';
require_once dirname(__FILE__).'/vendor/james-heinrich/getid3/getid3/getid3.php';
require_once dirname(__FILE__).'/json.php';

header("Access-Control-Allow-Origin: http://localhost:4200");
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header('Content-Type: application/json');

$SPOTIFY_CLIENT_ID = $json['SPOTIFY_CLIENT_ID'];
$SPOTIFY_CLIENT_SECRET = $json['SPOTIFY_CLIENT_SECRET'];

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

function getSpotifyAccessToken($clientId, $clientSecret) {
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

function getArtistImageFromSpotify($artistName, $accessToken) {
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
        error_log("Failed to fetch artist image from Spotify for $artistName: " . error_get_last()['message']);
        return 'assets/default-artist.jpg'; // Fallback to a default image if none found
    }

    $data = json_decode($response, true);
    if (isset($data['artists']['items'][0]['images'][0]['url'])) {
        return $data['artists']['items'][0]['images'][0]['url'];
    }

    return 'assets/default-artist.jpg'; // Fallback to a default image if none found
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    error_log("Received POST request");
    $data = json_decode(file_get_contents('php://input'), true);
    error_log("Received data: " . print_r($data, true));

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
    $tracksMap = [];

    // Create a map of existing artists and albums for faster lookup
    foreach ($db['artists'] as $artist) {
        $artistsMap[$artist['name']] = $artist;
    }

    foreach ($db['albums'] as $album) {
        $albumsMap[$album['title']] = $album;
    }

    foreach ($db['musics'] as $music) {
        $tracksMap[$music['title']] = $music;
    }

    $spotifyAccessToken = getSpotifyAccessToken($SPOTIFY_CLIENT_ID, $SPOTIFY_CLIENT_SECRET);

    foreach ($filePaths as $filePath) {
        // Relative path to the audio file
        $absoluteFilePath = realpath("../../angular-app/src/assets/" . $filePath);
        if ($absoluteFilePath && file_exists($absoluteFilePath)) {
            $metadata = analyzeFile($absoluteFilePath);

            // Add the artist if it does not already exist
            if (!isset($artistsMap[$metadata['artist']])) {
                $artistId = count($db['artists']) + 1;
                $artistImage = $spotifyAccessToken ? getArtistImageFromSpotify($metadata['artist'], $spotifyAccessToken) : 'assets/default-artist.jpg';
                $newArtist = [
                    'id' => $artistId,
                    'name' => $metadata['artist'],
                    'pictureUrl' => $artistImage
                ];
                $db['artists'][] = $newArtist;
                $artistsMap[$metadata['artist']] = $newArtist;
            }

            // Add the album if it does not already exist
            if (!isset($albumsMap[$metadata['album']])) {
                $albumId = count($db['albums']) + 1;
                $coverUrl = $metadata['coverUrl'] ?? $artistsMap[$metadata['artist']]['pictureUrl'] ?? null;
                $newAlbum = [
                    'id' => $albumId,
                    'title' => $metadata['album'],
                    'artist' => $metadata['artist'],
                    'artistId' => $artistsMap[$metadata['artist']]['id'],
                    'coverUrl' => $coverUrl,
                    'tracks' => []
                ];
                $db['albums'][] = $newAlbum;
                $albumsMap[$metadata['album']] = $newAlbum;
            }

            // Check if the music already exists in the database
            $musicExists = false;
            foreach ($db['musics'] as $music) {
                if ($music['filePath'] === $metadata['filePath']) {
                    $musicExists = true;
                    break;
                }
            }

            // Add the music if it does not already exist
            if (!$musicExists) {
                $metadata['artistId'] = $artistsMap[$metadata['artist']]['id'];
                $db['musics'][] = $metadata;
                $db['albums'][$albumsMap[$metadata['album']]['id'] - 1]['tracks'][] = [
                    'title' => $metadata['title'],
                    'duration' => $metadata['duration']
                ];
            }
        } else {
            error_log("File not found: " . $filePath);
        }
    }

    file_put_contents($dbFile, json_encode($db, JSON_PRETTY_PRINT));

    echo json_encode(['success' => true, 'message' => 'Directory scanned successfully']);
} else {
    echo json_encode(['error' => 'Invalid request method']);
}
?>
