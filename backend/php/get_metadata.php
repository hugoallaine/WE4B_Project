<?php
require_once dirname(__FILE__).'/vendor/autoload.php';
require_once dirname(__FILE__).'/vendor/james-heinrich/getid3/getid3/getid3.php';

header("Access-Control-Allow-Origin: http://localhost:4200");
header("Access-Control-Allow-Methods: GET");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header('Content-Type: application/json');

function fetchFromMusicBrainz($title, $artist, $album = null, $year = null) {
    $queryParts = [];
    if (!empty($title)) {
        $queryParts[] = 'recording:' . urlencode($title);
    }
    if (!empty($artist)) {
        $queryParts[] = 'artist:' . urlencode($artist);
    }
    if (!empty($album)) {
        $queryParts[] = 'release:' . urlencode($album);
    }
    if (!empty($year)) {
        $queryParts[] = 'date:' . urlencode($year);
    }
    $query = implode(' AND ', $queryParts);
    $url = "https://musicbrainz.org/ws/2/recording?query=$query&fmt=json";

    echo "Request URL : $url\n";

    $options = [
        'http' => [
            'header' => "User-Agent: Flex/1.0 (zentoxll@gmail.com)\r\n"
        ]
    ];
    $context = stream_context_create($options);
    $response = file_get_contents($url, false, $context);
    
    if ($response === FALSE) {
        return null;
    }

    return json_decode($response, true);
}

function fetchCoverArt($releaseGroupId) {
    $url = "https://coverartarchive.org/release-group/$releaseGroupId";
    $options = [
        'http' => [
            'header' => "User-Agent: Flex/1.0 (zentoxll@gmail.com)\r\n"
        ]
    ];
    $context = stream_context_create($options);
    $response = file_get_contents($url, false, $context);
    
    if ($response === FALSE) {
        return null;
    }

    return json_decode($response, true);
}

if (isset($_GET['file'])) {
    $relativePath = "../../angular-app/src/";
    $file = realpath($relativePath . $_GET['file']);

    if (!file_exists($file)) {
        echo json_encode(['error' => 'File does not exist', 'actual_dir' => __DIR__]);
        exit;
    }

    $getID3 = new getID3;
    $fileInfo = $getID3->analyze($file);

    $title = isset($fileInfo['tags']['id3v2']['title'][0]) ? $fileInfo['tags']['id3v2']['title'][0] : null;
   $artist = isset($fileInfo['tags']['id3v2']['artist'][0]) ? $fileInfo['tags']['id3v2']['artist'][0] : null;
    $album = isset($fileInfo['tags']['id3v2']['album'][0]) ? $fileInfo['tags']['id3v2']['album'][0] : null;
    $year = isset($fileInfo['tags']['id3v2']['year'][0]) ? $fileInfo['tags']['id3v2']['year'][0] : null;

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

    if (!$title || !$artist || !$metadata['coverUrl']) {
        $musicBrainzData = fetchFromMusicBrainz($title, $artist, $album, $year);
        if ($musicBrainzData && isset($musicBrainzData['recordings'][0])) {
            $recording = $musicBrainzData['recordings'][0];
            $metadata['title'] = $recording['title'];
            $metadata['artist'] = $recording['artist-credit'][0]['name'];

            // Fetch cover art from Cover Art Archive if it's missing
            if (!$metadata['coverUrl'] || $metadata['coverUrl'] == 'assets/default-cover.jpg') {
                $releaseGroupId = $recording['releases'][0]['release-group']['id'];
                $coverArtData = fetchCoverArt($releaseGroupId);
                if ($coverArtData && isset($coverArtData['images'][0]['image'])) {
                    $metadata['coverUrl'] = $coverArtData['images'][0]['image'];
                }
            }
        }
    }

    echo json_encode($metadata);
} else {
    echo json_encode(['error' => 'No file specified']);
}
