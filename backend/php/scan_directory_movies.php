<?php
require_once 'vendor/autoload.php';
require_once dirname(__FILE__).'/json.php';

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

use GuzzleHttp\Client;

$apiKey = $json['tmdb_api_key'];
$dbFile = dirname(__DIR__) . '/json/movies.json';
$baseMoviePath = 'video/';

function extractMetadata($filePath) {
    $getID3 = new getID3;
    $fileInfo = $getID3->analyze($filePath);
    return $fileInfo;
}

function fetchTMDBInfo($title) {
    global $apiKey;
    $client = new Client();
    $response = $client->request('GET', 'https://api.themoviedb.org/3/search/movie', [
        'query' => [
            'query' => $title,
        ],
        'headers' => [
            'accept' => 'application/json',
            'Authorization' => 'Bearer ' . $apiKey,
        ],
    ]);

    error_log("TMDB API Response Status Code: ".$response->getStatusCode());
    return $response;
}

function parseTitle($fileName) {
    $baseName = pathinfo($fileName, PATHINFO_FILENAME);
    if (preg_match('/^(.*) \((\d{4})\)$/', $baseName, $matches)) {
        return trim($matches[1]);
    } else {
        return cleanTitle($baseName);
    }
}

function cleanTitle($title) {
    $title = str_replace(['.', '_'], ' ', $title);
    $title = preg_replace('/[^a-zA-Z0-9 ]/', '', $title);
    return trim($title);
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    error_log("Received POST request");
    $data = json_decode(file_get_contents('php://input'), true);
    error_log("Received data: " . print_r($data, true));

    $path = $data['directoryPath'];
    error_log("Directory path: " . $path);

    $db = ['movies' => []];
    
    if (is_dir($path)) {
        $files = scandir($path);
        
        foreach ($files as $file) {
            if ($file !== '.' && $file !== '..') {
                $filePath = $path . DIRECTORY_SEPARATOR . $file;
                if (is_file($filePath)) {
                    $metadata = extractMetadata($filePath);
                    $title = $metadata['comments']['title'][0] ?? cleanTitle($file);
                    $tmdbResponse = fetchTMDBInfo($title);
                    if (empty(json_decode($tmdbResponse->getBody(),true)['results'][0])) {
                        error_log("No results found for $title, trying with ".parseTitle($file));
                        $title = parseTitle($file);
                        $tmdbResponse = fetchTMDBInfo($title);
                    }
                    
                    if ($tmdbResponse->getStatusCode() === 200 && isset(json_decode($tmdbResponse->getBody(),true)['results'][0])) {
                        $movieInfo = json_decode($tmdbResponse->getBody(),true)['results'][0];
                        $db['movies'][] = [
                            'id' => $movieInfo['id'],
                            'title' => $movieInfo['title'] ?? pathinfo($filePath, PATHINFO_FILENAME),
                            'picturePath' => 'https://image.tmdb.org/t/p/w500' . $movieInfo['poster_path'] ?? 'assets/logo/flex-logo-gris.svg',
                            'year' => substr($movieInfo['release_date'], 0, 4),
                            'description' => $movieInfo['overview'],
                            'duration' => $metadata['playtime_seconds'] / 60,
                            'filePath' => $baseMoviePath . basename($filePath)
                        ];
                    } else {
                        $db['movies'][] = [
                            'id' => 0,
                            'title' => pathinfo($filePath, PATHINFO_FILENAME),
                            'author' => $metadata['comments']['artist'][0] ?? 'Unknown Author',
                            'picturePath' => 'assets/logo/flex-logo-gris.svg',
                            'year' => null,
                            'description' => 'No description available',
                            'duration' => $metadata['playtime_seconds'] / 60,
                            'filePath' => $baseMoviePath . basename($filePath)
                        ];
                    
                    }
                }
            }
        }
        file_put_contents($dbFile, json_encode($db, JSON_PRETTY_PRINT));
        $response = ['success' => 'Movies scanned successfully'];
    } else {
        $response = ['error' => 'Invalid directory path'];
    }
    echo json_encode($response);
} else {
    echo json_encode(['error' => 'Invalid request']);
}
?>
