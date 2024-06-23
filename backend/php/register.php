<?php
header("Access-Control-Allow-Origin: http://localhost:4200");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
require_once dirname(__FILE__) . '/db.php';
require_once dirname(__FILE__) . '/mails.php';
require_once dirname(__FILE__) . '/vendor/autoload.php';
require_once dirname(__FILE__) . '/json.php';

$data = json_decode(file_get_contents("php://input"));

/**
 * Function to get the real IP of the user even if he is behind a proxy
 * @return string
 */
function getIp()
{
    if (!empty($_SERVER['HTTP_CLIENT_IP'])) {
        $ip = $_SERVER['HTTP_CLIENT_IP'];
    } elseif (!empty($_SERVER['HTTP_X_FORWARDED_FOR'])) {
        $ip = $_SERVER['HTTP_X_FORWARDED_FOR'];
    } else {
        $ip = $_SERVER['REMOTE_ADDR'];
    }
    return $ip;
}

/**
 * API to register a user
 * 
 * POST Parameters:
 * - user (string): the email
 * - password (string): the password
 * - pseudo (string): the pseudo
 * - name (string): the name
 * - firstname (string): the firstname
 * - birthdate (string): the birthdate
 * 
 * Response:
 * - success (boolean): true if the request was successful
 * - error (boolean): true if an error occured
 * - message (string): the error message
 * - info (boolean): true if an info message is present
 */
if (isset($data->user) && isset($data->password) && isset($data->password2) && isset($data->pseudo) && isset($data->name) && isset($data->firstname) && isset($data->birthdate)) {
    $email = SecurizeString_ForSQL($data->user);
    $password = SecurizeString_ForSQL($data->password);
    $password2 = SecurizeString_ForSQL($data->password2);
    $pseudo = SecurizeString_ForSQL($data->pseudo);
    $name = SecurizeString_ForSQL($data->name);
    $firstname = SecurizeString_ForSQL($data->firstname);
    $birthdate = $data->birthdate;
    if (!empty($email) && !empty($password) && !empty($password2) && !empty($pseudo) && !empty($name) && !empty($firstname) && !empty($birthdate)) {
        if (strlen($pseudo) <= 32) {
            if (strlen($name) <= 32 && strlen($firstname) <= 32) {
                if (filter_var($email, FILTER_VALIDATE_EMAIL)) {
                    $req = $db->prepare("SELECT id FROM users WHERE email = ?");
                    $req->execute(array($email));
                    $emailexist = $req->rowCount();
                    if ($emailexist == 0) {
                        if ($password == $password2) {
                            if (strlen($password) >= 12 && preg_match('/[A-Z]/', $password) && preg_match('/[a-z]/', $password) && preg_match('/[0-9]/', $password) && preg_match('/[^a-zA-Z0-9]/', $password)) {
                                $password = password_hash($password, PASSWORD_DEFAULT);
                                $key = generateToken(255);
                                $token = generateToken(255);
                                $req = $db->prepare("INSERT INTO users(email,password,token,name,firstname,birth_date,pseudo) VALUES (?,?,?,?,?,?,?)");
                                $req->execute(array($email, $password, $token, $name, $firstname, $birthdate, $pseudo));
                                $req = $db->prepare("SELECT id FROM users WHERE email = ?");
                                $req->execute(array($email));
                                $id = $req->fetch()['id'];
                                if (checkToken($token, $id)) {
                                    while (checkToken($token, $id)) {
                                        $token = generateToken(255);
                                    }
                                    $req = $db->prepare("UPDATE users SET token = ? WHERE id = ?");
                                    $req->execute(array($token, $id));
                                }
                                $req = $db->prepare("INSERT INTO emailsnonverifies(email,token,id_user) VALUES (?,?,(SELECT id FROM users WHERE email = ?))");
                                $req->execute(array($email, $key, $email));
                                sendMailConfirm($email, $key);
                            } else {
                                $error = "Your password does not meet the minimum requirements.";
                            }
                        } else {
                            $error = "Your passwords don't match.";
                        }
                    } else {
                        $error = "This email address already exists.";
                    }
                } else {
                    $error = "Invalid email address.";
                }
            } else {
                $error = "Your first and last name must not exceed 32 characters.";
            }
        } else {
            $error = "Your username must not exceed 32 characters.";
        }
    } else {
        $error = "All fields must be completed.";
    }
}

if (isset($error)) {
    header('Content-Type: application/json');
    echo json_encode(array('success' => false, 'error' => true, 'message' => $error));
} elseif (isset($info)) {
    header('Content-Type: application/json');
    echo json_encode(array('success' => true, 'error' => false, 'info' => true, 'message' => $info));
} else {
    header('Content-Type: application/json');
    echo json_encode(array('success' => true, 'error' => false, 'message' => 'Registration successful. A confirmation e-mail has been sent to you.'));
}
?>