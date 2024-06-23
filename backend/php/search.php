<?php
header("Access-Control-Allow-Origin: http://localhost:4200");
header("Access-Control-Allow-Methods: GET");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

$query = isset($_GET['q']) ? strtolower(trim($_GET['q'])) : '';

$json_musics = file_get_contents(dirname(__DIR__).'/json/musics.json');
$json_movies = file_get_contents(dirname(__DIR__).'/json/movies.json');

$searchResults = [
    'artists' => [],
    'albums' => [],
    'tracks' => [],
    'movies' => []
];

if ($query !== '') {
    $data = json_decode($json_musics, true);
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
    $data = json_decode($json_movies, true);
    foreach ($data['movies'] as $movie) {
        if (strpos(strtolower($movie['title']), $query) !== false) {
            $searchResults['movies'][] = $movie;
        }
    }
}

header('Content-Type: application/json');
echo json_encode($searchResults);
?>
