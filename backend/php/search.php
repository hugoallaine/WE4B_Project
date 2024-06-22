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
        foreach ($artist['albums'] as $album) {
            if (strpos(strtolower($album['title']), $query) !== false) {
                $albumWithArtist = $album;
                $albumWithArtist['artist'] = $artist;
                $searchResults['albums'][] = $albumWithArtist;
            }
            foreach ($album['tracks'] as $track) {
                if (strpos(strtolower($track['title']), $query) !== false) {
                    $trackWithArtist = $track;
                    $trackWithArtist['albumId'] = $album['id'];
                    $trackWithArtist['artist'] = $artist;
                    $searchResults['tracks'][] = $trackWithArtist;
                }
            }
        }
    }
}

header('Content-Type: application/json');
echo json_encode($searchResults);
?>
