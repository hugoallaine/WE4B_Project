<?php
require_once dirname(__FILE__).'/db.php';

/**
 * API to verify the email address
 * 
 * Request:
 * - email (string): the user e-mail address
 * - key (string): the verification key
 * 
 * Response:
 * - the verification result
 */
if (isset($_GET['email']) && isset($_GET['key'])) {
    $email = urldecode($_GET['email']);
    $key = urldecode($_GET['key']);
    if (!empty($email) && !empty($key)) {
        $req = $db->prepare("SELECT * FROM emailsnonverifies WHERE email = ? AND token = ?");
        $req->execute(array($email, $key));
        $userexist = $req->rowCount();
        if ($userexist) {
            $user = $req->fetch();
            $req = $db->prepare("SELECT * FROM users WHERE email = ?");
            $req->execute(array($email));
            $user = $req->fetch();
            if ($user['verified'] == 0) {
                $req = $db->prepare("UPDATE users SET verified = 1 WHERE email = ?");
                $req->execute(array($email));
                $req = $db->prepare("DELETE FROM emailsnonverifies WHERE email = ?");
                $req->execute(array($email));
                echo "Vérification réussie.";
            } else {
                echo "Vous êtes déjà vérifié.";
            }
        } else {
            echo "Echec de vérification.";
        }
    } else {
        echo "Paramètres manquants.";
    }
}

?>