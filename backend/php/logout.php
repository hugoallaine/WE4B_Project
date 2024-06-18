<?php
/**
 * API to manage the logout action
 */
header("Access-Control-Allow-Origin: http://localhost:4200");
header("Access-Control-Allow-Methods: GET");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
session_start();
unset($_SESSION);
session_destroy();
header('Content-Type: application/json');
echo json_encode(["success" => true, "message" => "Logout successful"]);
?>