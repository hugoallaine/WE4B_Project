<?php
/**
 * API to manage the logout action
 */
session_start();
unset($_SESSION);
session_destroy();
header('Content-Type: application/json');
echo json_encode(["success" => true, "message" => "Logout successful"]);
?>