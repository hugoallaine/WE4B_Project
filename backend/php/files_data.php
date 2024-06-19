<?php
function readJsonData($filePath) {
    if (!file_exists($filePath)) {
        return null;
    }
    $json = file_get_contents($filePath);
    return json_decode($json, true);
}

function writeJsonData($filePath, $data) {
    $json = json_encode($data, JSON_PRETTY_PRINT);
    file_put_contents($filePath, $json);
}
?>
