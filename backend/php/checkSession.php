<?php
require_once dirname(__FILE__).'/alreadyConnected.php';
session_start_secure();

/**
 * API to check the session status
 * 
 *  Response:
 * - error (boolean): true if an error occured
 * - message (string): the error message
 * - status (boolean): true if the user is connected
 * - pseudo (string): the pseudo of the user
 */
header('Content-Type: application/json');
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $status = isConnected();
    $pseudo = $status ? $_SESSION['pseudo'] : null;
    echo json_encode(array('error' => false, 'status' => $status, 'pseudo' => $pseudo));
} else {
    echo json_encode(array('error' => true, 'message' => 'Invalid request method'));
}

?>