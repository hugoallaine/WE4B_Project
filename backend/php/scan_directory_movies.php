<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
require_once 'vendor/autoload.php';
require_once dirname(__FILE__).'/json.php';
use GuzzleHttp\Client;

// Configuration
$apiKey = $json['tmdb_api_key'];
$dbFile = dirname(__DIR__) . '/json/movies.json';
$baseMoviePath = 'video/';

/**
 * Function to extract metadata from a file
 * @param string $filePath Path to the file
 * @return array Metadata
 */
function extractMetadata($filePath) {
    $getID3 = new getID3;
    $fileInfo = $getID3->analyze($filePath);
    return $fileInfo;
}

/**
 * Function to fetch movie information from TMDB
 * @param string $title Movie title
 * @return object TMDB API response (json)
 */
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

/**
 * Function to parse the title of a movie
 * @param string $fileName File name
 * @return string Title
 */
function parseTitle($fileName) {
    $baseName = pathinfo($fileName, PATHINFO_FILENAME);
    if (preg_match('/^(.*) \((\d{4})\)$/', $baseName, $matches)) {
        return trim($matches[1]);
    } else {
        return cleanTitle($baseName);
    }
}

/**
 * Function to clean a title
 * @param string $title Title
 * @return string Cleaned title
 */
function cleanTitle($title) {
    $title = str_replace(['.', '_'], ' ', $title);
    $title = preg_replace('/[^a-zA-Z0-9 ]/', '', $title);
    return trim($title);
}

/**
 * API to scan a directory for movies
 * 
 * Request:
 * - directoryPath (string): the path to the directory
 * 
 * Response:
 * - success (string): the success message
 * - error (string): the error message
 */
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
