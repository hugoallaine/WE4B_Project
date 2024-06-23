<?php
$path = isset($_GET['path']) ? rawurldecode($_GET['path']) : '';

if (empty($path)) {
    http_response_code(400);
    exit('Path parameter is missing');
}

$path = realpath(__DIR__ . '/../../' . $path);
$baseDir = realpath(__DIR__ . '/../../');

error_log("Requested path: " . $_GET['path']);
error_log("Resolved path: " . $path);

if ($path === false || strpos($path, $baseDir) !== 0) {
    http_response_code(404);
    exit('File not found');
}

if (!file_exists($path)) {
    http_response_code(404);
    exit('File not found');
}

$size = filesize($path);
$length = $size;
$start = 0;
$end = $size - 1;
$mimeType = mime_content_type($path);

header("Content-Type: $mimeType");
header("Accept-Ranges: bytes");

if (isset($_SERVER['HTTP_RANGE'])) {
    $range = $_SERVER['HTTP_RANGE'];
    $range = str_replace('bytes=', '', $range);
    list($start, $end) = explode('-', $range);
    if ($start == '') $start = 0;
    if ($end == '') $end = $size - 1;
    $length = $end - $start + 1;
    header("HTTP/1.1 206 Partial Content");
    header("Content-Range: bytes $start-$end/$size");
}

header("Content-Length: $length");

$fp = fopen($path, 'rb');
fseek($fp, $start);
$bufferSize = 1024 * 8;
while (!feof($fp) && ($pos = ftell($fp)) <= $end) {
    if ($pos + $bufferSize > $end) {
        $bufferSize = $end - $pos + 1;
    }
    set_time_limit(0);
    echo fread($fp, $bufferSize);
    flush();
}
fclose($fp);
exit;
