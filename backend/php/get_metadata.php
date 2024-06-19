<?php
require_once dirname(__FILE__).'/vendor/autoload.php';
require_once dirname(__FILE__).'/vendor/james-heinrich/getid3/getid3/getid3.php';

header("Access-Control-Allow-Origin: http://localhost:4200");
header("Access-Control-Allow-Methods: GET");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

function fetchFromMusicBrainz($title, $artist) {
    $query = urlencode("$title $artist");
    $url = "https://musicbrainz.org/ws/2/recording?query=$query&fmt=json";
    $response = file_get_contents($url);
    return json_decode($response, true);
}

header('Access-Control-Allow-Origin: *');
header('Content-Type: application/json');

if (isset($_GET['file'])) {
    $file = $_GET['file'];
    $getID3 = new getID3;
    $fileInfo = $getID3->analyze($file);

    $title = isset($fileInfo['tags']['id3v2']['title'][0]) ? $fileInfo['tags']['id3v2']['title'][0] : null;
    $artist = isset($fileInfo['tags']['id3v2']['artist'][0]) ? $fileInfo['tags']['id3v2']['artist'][0] : null;

    $metadata = [
        'title' => $title ?: 'Unknown Title',
        'artist' => $artist ?: 'Unknown Artist',
        'coverUrl' => null
    ];

    if (isset($fileInfo['comments']['picture'][0])) {
        $picture = $fileInfo['comments']['picture'][0];
        $base64Image = base64_encode($picture['data']);
        $metadata['coverUrl'] = 'data:' . $picture['image_mime'] . ';base64,' . $base64Image;
    }

    if (!$title || !$artist) {
        $musicBrainzData = fetchFromMusicBrainz($title ?: '', $artist ?: '');
        if (isset($musicBrainzData['recordings'][0])) {
            $recording = $musicBrainzData['recordings'][0];
            $metadata['title'] = $recording['title'];
            $metadata['artist'] = $recording['artist-credit'][0]['name'];

            // Fetch cover art from Cover Art Archive
            if (!$metadata['coverUrl'] || $metadata['coverUrl'] == 'assets/default-cover.jpg') {
                $releaseGroupId = $recording['releases'][0]['release-group']['id'];
                $coverArtUrl = "https://coverartarchive.org/release-group/$releaseGroupId";
                $coverArtResponse = file_get_contents($coverArtUrl);
                $coverArtData = json_decode($coverArtResponse, true);
                if (isset($coverArtData['images'][0]['image'])) {
                    $metadata['coverUrl'] = $coverArtData['images'][0]['image'];
                }
            }
        }
    }

    echo json_encode($metadata);
} else {
    echo json_encode(['error' => 'No file specified']);
}
