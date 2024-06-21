<?php
header("Access-Control-Allow-Origin: http://localhost:4200");
header("Access-Control-Allow-Methods: GET");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

$query = isset($_GET['q']) ? strtolower(trim($_GET['q'])) : '';

$json = file_get_contents(dirname(__DIR__).'/json/files_data.json');
$data = json_decode($json, true);

$searchResults = [
    'artists' => [],
    'albums' => [],
    'tracks' => []
];

if ($query !== '') {
    foreach ($data['artists'] as $artist) {
        if (strpos(strtolower($artist['name']), $query) !== false) {
            $searchResults['artists'][] = $artist;
        }
    }

    foreach ($data['albums'] as $album) {
        if (strpos(strtolower($album['title']), $query) !== false || strpos(strtolower($album['artist']), $query) !== false) {
            $searchResults['albums'][] = $album;
        }
        foreach ($album['tracks'] as $track) {
            if (strpos(strtolower($track['title']), $query) !== false) {
                $track['album'] = $album;
                $searchResults['tracks'][] = $track;
            }
        }
    }
}

header('Content-Type: application/json');
echo json_encode($searchResults);
?>
