<?php
require_once dirname(__FILE__).'/files_data.php';
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json");

$data = readJsonData(dirname(__FILE__).'/../json/files_data.json');
echo json_encode($data);
?>
