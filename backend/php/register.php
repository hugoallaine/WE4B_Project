<?php
header("Access-Control-Allow-Origin: http://localhost:4200");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
require_once dirname(__FILE__) . '/db.php';
require_once dirname(__FILE__) . '/mails.php';
require_once dirname(__FILE__) . '/vendor/autoload.php';
require_once dirname(__FILE__) . '/json.php';

// Réception des données JSON
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
 * - mail1-r (string): the first part of the email
 * - mail2-r (string): the second part of the email
 * - password-r (string): the password
 * - password2-r (string): the confirmation of the password
 * - pseudo-r (string): the pseudo
 * - name-r (string): the name
 * - firstname-r (string): the firstname
 * - birthdate-r (string): the birthdate
 * - address-r (string): the address
 * - city-r (string): the city
 * - zipcode-r (string): the zipcode
 * - country-r (string): the country
 * - g-recaptcha-response (string): the reCaptcha response
 * 
 * Response:
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
                                $req = $db->prepare("INSERT INTO users(email,password,name,firstname,birth_date,pseudo) VALUES (?,?,?,?,?,?)");
                                $req->execute(array($email, $password, $name, $firstname, $birthdate, $pseudo));
                                $req = $db->prepare("SELECT id FROM users WHERE email = ?");
                                $req->execute(array($email));
                                $id = $req->fetch()['id'];
                                $token = generateToken(255);
                                while (checkToken($token, $id) == true) {
                                    $token = generateToken(255);
                                }
                                $req = $db->prepare("UPDATE users SET token = ? WHERE id = ?");
                                $req->execute(array($token, $id));
                                if (isset($_FILES['avatar-r']) && $_FILES['avatar-r']['error'] === UPLOAD_ERR_OK) {
                                    if ($_FILES['avatar-r']['size'] <= 2097152) {
                                        $req = $db->prepare("SELECT id FROM users WHERE email = ?");
                                        $req->execute(array($email));
                                        $line = $req->fetch();
                                        $filename = $_FILES['avatar-r']['name'];
                                        $file_extension = pathinfo($filename, PATHINFO_EXTENSION);
                                        $allowed_extensions = array('jpg', 'jpeg', 'png', 'gif');
                                        if (in_array($file_extension, $allowed_extensions) === true) {
                                            $newfilename = "avatar." . $file_extension;
                                            $tmp_name = $_FILES['avatar-r']['tmp_name'];
                                            $upload_directory = '../img/user/' . $line['id'] . '/';
                                            if (!file_exists($upload_directory)) {
                                                mkdir($upload_directory, 0777, true);
                                            }
                                            $path = $upload_directory . $newfilename;
                                            move_uploaded_file($tmp_name, $path);
                                            $avatar = $newfilename;
                                            $req = $db->prepare("UPDATE users SET avatar = ? WHERE email = ?");
                                            $req->execute(array($avatar, $email));
                                        } else {
                                            $info = "Votre avatar doit être au format jpg, jpeg, png ou gif et ne doit pas dépasser 2 Mo.";
                                        }
                                    }
                                }
                                $req = $db->prepare("INSERT INTO emailsnonverifies(email,token,id_user) VALUES (?,?,(SELECT id FROM users WHERE email = ?))");
                                $req->execute(array($email, $key, $email));
                                sendMailConfirm($email, $key);
                            } else {
                                $error = "Votre mot de passe ne satisfait pas les conditions minimums.";
                            }
                        } else {
                            $error = "Vos mots de passe ne correspondent pas.";
                        }
                    } else {
                        $error = "Cette adresse email existe déjà.";
                    }
                } else {
                    $error = "Votre adresse email n'est pas valide.";
                }
            } else {
                $error = "Votre nom et prénom ne doivent pas dépasser 32 caractères !";
            }
        } else {
            $error = "Votre nom d'utilisateur ne doit pas dépasser 32 caractères !";
        }
    } else {
        $error = "Tous les champs doivent être complétés !";
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
    echo json_encode(array('success' => true, 'error' => false));
}
?>