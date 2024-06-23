<?php
header("Access-Control-Allow-Origin: http://localhost:4200");
header("Access-Control-Allow-Methods: GET");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
require_once dirname(__FILE__).'/alreadyConnected.php';
session_start_secure();

/**
 * API to check the session status
 * 
 *  Response:
 * - success (boolean): true if the request was successful
 * - error (boolean): true if an error occured
 * - message (string): the error message
 * - id (int): the user id
 * - token (string): the user token
 */
header('Content-Type: application/json');
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    if (isset($_GET['id']) && isset($_GET['token'])) {
        $id = SecurizeString_ForSQL(urldecode($_GET['id']));
        $token = SecurizeString_ForSQL(urldecode($_GET['token']));
        $req = $db->prepare('SELECT id,token FROM users WHERE id = ? AND token = ?');
        $req->execute([$id, $token]);
        $user = $req->fetch();
        if ($user) {
            echo json_encode(["success" => true, 'error' => false, 'id' => $user['id'], 'token' => $user['token']]);
        } else {
            echo json_encode(["success" => false, 'error' => true]);
        }
    } else {
        echo json_encode(["success" => false, 'error' => true, 'message' => 'Missing parameters']);
    }
} else {
    echo json_encode(["success" => false, 'error' => true, 'message' => 'Invalid request method']);
}

?>