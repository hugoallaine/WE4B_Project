<?php
header("Access-Control-Allow-Origin: http://localhost:4200");
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
require_once dirname(__FILE__).'/alreadyConnected.php';
session_start_secure();
require_once dirname(__FILE__).'/db.php';
require_once dirname(__FILE__).'/vendor/autoload.php';
use RobThree\Auth\TwoFactorAuth;
$tfa = new TwoFactorAuth($issuer = 'Flex');

// Réception des données JSON
$data = json_decode(file_get_contents("php://input"));

if (isset($data->user) && isset($data->password)) {
    $email = SecurizeString_ForSQL($data->user);
    $password = SecurizeString_ForSQL($data->password);
    if (!empty($email) AND !empty($password)) {
        $req = $db->prepare("SELECT id,email,password,token,pseudo,avatar,verified,tfaKey FROM users WHERE email = ?");
        $req->execute(array($email));
        $isUserExist = $req->rowCount();
        if ($isUserExist) {
            $user = $req->fetch();
            if (password_verify($password, $user['password'])) {
                if ($user['verified']) {
                    if (!empty($user['tfaKey']) && !empty($data->tfa_code)) {
                        if ($tfa->verifyCode($user['tfaKey'], $data->tfa_code)) {
                            $_SESSION['id'] = $user['id'];
                            $_SESSION['email'] = $user['email'];
                            $_SESSION['token'] = $user['token'];
                            $_SESSION['pseudo'] = $user['pseudo'];
                            $_SESSION['avatar'] = empty($user['avatar']) ? null : $user['avatar'];
                            echo json_encode(['success' => true, 'message' => 'Login successful']);
                        } else {
                            $error = "Code invalide.";
                        }
                    } else if (!empty($user['tfaKey']) && empty($data->tfa_code)) {
                        echo json_encode(['tfa' => true]);
                    } else {
                        $_SESSION['id'] = $user['id'];
                        $_SESSION['email'] = $user['email'];
                        $_SESSION['token'] = $user['token'];
                        $_SESSION['pseudo'] = $user['pseudo'];
                        $_SESSION['avatar'] = empty($user['avatar']) ? null : $user['avatar'];
                        echo json_encode(['success' => true, 'message' => 'Login successful']);
                    }
                } else {
                    $error = "Votre adresse mail n'a pas été confirmée, consultez votre boîte mail.";
                }
            } else {
                $error = "Mot de passe ou adresse mail invalide.";
            }
        } else {
            $error = "Mot de passe ou adresse mail invalide.";
        }
    } else {
        $error = "Tous les champs doivent être complétés.";
    }
}

if (isset($error)) {
    echo json_encode(['error' => true, 'message' => $error]);
}
?>
