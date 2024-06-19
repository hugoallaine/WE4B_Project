<?php
header("Access-Control-Allow-Origin: http://localhost:4200");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
require_once dirname(__FILE__).'/alreadyConnected.php';
session_start_secure();
require_once dirname(__FILE__).'/db.php';
require_once dirname(__FILE__).'/mails.php';
require_once dirname(__FILE__).'/vendor/autoload.php';
use RobThree\Auth\TwoFactorAuth;
use RobThree\Auth\Providers\Qr\EndroidQrCodeProvider;
$tfa = new TwoFactorAuth(new EndroidQrCodeProvider());

/**
 * API to change account informations
 * 
 * POST parameters:
 * - Change informations:
 *   - pseudo (string): the new pseudo
 *   - firstname (string): the new firstname
 *   - name (string): the new name
 *   - birthdate (string): the new birthdate
 * - Change avatar:
 *   - avatar-f (file): the new avatar
 * - Change password:
 *   - oldPassword (string): the old password
 *   - newPassword (string): the new password
 *   - newPasswordConfirm (string): the new password confirmation
 * - Enable 2FA:
 *   - tfa_code (string): the 2FA code
 *   - password_check_tfa (string): the password to check 2FA
 *   - tfa_secret (string): the 2FA secret
 * - Disable 2FA:
 *   - password_check (string): the password to check
 * - Delete account:
 *   - password_check_delete (string): the password to delete account
 * 
 * Response:
 * - success (boolean): true if the action succeeded
 * - error (boolean): true if an error occured
 * - message (string): the error message
 */

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    // Get informations
    if (isset($_GET['id']) && isset($_GET['token']) && !isset($_GET['tfa'])) {
        $id = urldecode($_GET['id']);
        $token = SecurizeString_ForSQL(urldecode($_GET['token']));
        $req = $db->prepare("SELECT email, pseudo, name, firstname, birth_date FROM users WHERE id = ? AND token = ?");
        $req->execute(array($id, $token));
        $user = $req->fetch();
        if ($user) {
            header('Content-Type: application/json');
            echo json_encode(array('success' => true, 'error' => false, 'username' => $user['email'], 'pseudo' => $user['pseudo'], 'name' => $user['name'], 'firstname' => $user['firstname'], 'birthdate' => $user['birth_date']));
        } else {
            header('Content-Type: application/json');
            echo json_encode(array('success' => false, 'error' => true, 'message' => 'Invalid token'));
        }
    } else if (isset($_GET['id']) && isset($_GET['token']) && isset($_GET['tfa'])) {
        $id = urldecode($_GET['id']);
        $token = SecurizeString_ForSQL(urldecode($_GET['token']));
        $req = $db->prepare("SELECT email FROM users WHERE id = ? AND token = ?");
        $req->execute(array($id, $token));
        $user = $req->fetch();
        if ($user) {
            $tfa_secret = $tfa->createSecret();
            $qrcode = $tfa->getQRCodeImageAsDataUri($user['email'], $tfa_secret);
            header('Content-Type: application/json');
            echo json_encode(array('success' => true, 'error' => false, 'tfa_secret' => $tfa_secret, 'tfa_qrcode' => $qrcode));
        } else {
            header('Content-Type: application/json');
            echo json_encode(array('success' => false, 'error' => true, 'message' => 'Invalid token'));
        }
    } else {
        header('Content-Type: application/json');
        echo json_encode(array('error' => true, 'message' => 'Invalid parameters'));
    }
} elseif ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $data = json_decode(file_get_contents('php://input'));
    // Check token
    if (isset($data->id) && isset($data->token)) {
        $id = SecurizeString_ForSQL($data->id);
        $token = SecurizeString_ForSQL($data->token);
        if (checkToken($token, $id)) {
            // Change informations
            if (isset($data->pseudo) && isset($data->firstname) && isset($data->name) && isset($data->birthdate)) {
                $pseudo = SecurizeString_ForSQL($data->pseudo);
                $firstname = SecurizeString_ForSQL($data->firstname);
                $name = SecurizeString_ForSQL($data->name);
                $birthdate = SecurizeString_ForSQL($data->birthdate);
                $req = $db->prepare("SELECT u.name,u.firstname,u.birth_date,u.pseudo FROM users u WHERE u.id = ?");
                $req->execute(array($id));
                $oldinfos = $req->fetch();
                $count = 0;
                if ($oldinfos['firstname'] != $firstname && !empty($firstname) && strlen($firstname) <= 32) {
                    $req = $db->prepare("UPDATE users SET firstname = ? WHERE id = ?");
                    $req->execute(array($firstname, $id));
                    $count += 1;
                }
                if ($oldinfos['name'] != $name && !empty($name) && strlen($name) <= 32) {
                    $req = $db->prepare("UPDATE users SET name = ? WHERE id = ?");
                    $req->execute(array($name, $id));
                    $count += 1;
                }
                if ($oldinfos['birth_date'] != $birthdate && !empty($birthdate)) {
                    $req = $db->prepare("UPDATE users SET birth_date = ? WHERE id = ?");
                    $req->execute(array($birthdate, $id));
                    $count += 1;
                }
                if ($oldinfos['pseudo'] != $pseudo && !empty($pseudo) && strlen($pseudo) <= 32) {
                    $req = $db->prepare("UPDATE users SET pseudo = ? WHERE id = ?");
                    $req->execute(array($pseudo, $id));
                    $count += 1;
                }
                if ($count > 0) {
                    $req = $db->prepare("SELECT pseudo, name, firstname, birth_date FROM users WHERE id = ?");
                    $req->execute(array($id));
                    $newinfos = $req->fetch();
                    if ($newinfos) {
                        header('Content-Type: application/json');
                        echo json_encode(array('success' => true, 'error' => false, 'pseudo' => $newinfos['pseudo'], 'name' => $newinfos['name'], 'firstname' => $newinfos['firstname'], 'birthdate' => $newinfos['birth_date']));
                    } else {
                        header('Content-Type: application/json');
                        echo json_encode(array('success' => false, 'error' => true, 'message' => "An error occured."));
                    }
                } else {
                    header('Content-Type: application/json');
                    echo json_encode(array('success' => false, 'error' => true, 'message' => "No changes."));
                }
            }

            // Change avatar
            if (isset($_FILES['avatar-f']) && $_FILES['avatar-f']['error'] === UPLOAD_ERR_OK) {
                if ($_FILES['avatar-f']['size'] <= 2097152) {
                    $filename = $_FILES['avatar-f']['name'];
                    $file_extension = pathinfo($filename, PATHINFO_EXTENSION);
                    $allowed_extensions = array('jpg', 'jpeg', 'png', 'gif');
                    if (in_array($file_extension, $allowed_extensions) === true) {
                        $newfilename = "avatar.".$file_extension;
                        $tmp_name = $_FILES['avatar-f']['tmp_name'];
                        $upload_directory = '../img/user/'.$id.'/';
                        if (!file_exists($upload_directory)) {
                            mkdir($upload_directory, 0777, true);
                        }
                        $path = $upload_directory.$newfilename;
                        $req = $db->prepare("SELECT avatar FROM users WHERE id = ?");
                        $req->execute(array($id));
                        $oldfilename = $req->fetch();
                        if (!empty($oldfilename['avatar'])) {
                            unlink($upload_directory.$oldfilename['avatar']);
                        }
                        move_uploaded_file($tmp_name, $path);
                        $req = $db->prepare("UPDATE users SET avatar = ? WHERE id = ?");
                        $req->execute(array($newfilename, $id));
                        $_SESSION['avatar'] = $newfilename;
                    } else {
                        $error = "The avatar must be a jpg, jpeg, png or gif file.";
                    }
                } else {
                    $error = "The avatar must be less than 2MB.";
                }
            }

            // Change password
            if (isset($data->oldpassword) && isset($data->newpassword) && isset($data->newpasswordconfirm)) {
                $oldPassword = SecurizeString_ForSQL($data->oldpassword);
                $newPassword = SecurizeString_ForSQL($data->newpassword);
                $newPasswordConfirm = SecurizeString_ForSQL($data->newpasswordconfirm);
                $req = $db->prepare('SELECT password FROM users WHERE id = ?');
                $req->execute(array($id));
                $user = $req->fetch();
                if (password_verify($oldPassword, $user['password'])) {
                    if ($newPassword == $newPasswordConfirm) {
                        if (strlen($newPassword) >= 12 && preg_match('/[A-Z]/', $newPassword) && preg_match('/[a-z]/', $newPassword) && preg_match('/[0-9]/', $newPassword) && preg_match('/[^a-zA-Z0-9]/', $newPassword)) {
                            $req = $db->prepare('UPDATE users SET password = ? WHERE id = ?');
                            $req->execute(array(password_hash($newPassword, PASSWORD_DEFAULT), $id));
                            header('Content-Type: application/json');
                            echo json_encode(array('success' => true, 'error' => false));
                        } else {
                            $error = 'The password must contain at least 12 characters, one uppercase letter, one lowercase letter, one number and one special character.';
                        }
                    } else {
                        $error = 'The passwords do not match.';
                    }
                } else {
                    $error = 'Invalid password.';
                }
            }

            // Enable 2FA
            if (isset($data->tfa_code) && isset($data->passwordcheck) && isset($data->tfa_secret)) {
                $tfa_code = SecurizeString_ForSQL($data->tfa_code);
                $tfa_secret = SecurizeString_ForSQL($data->tfa_secret);
                $password_check_tfa = SecurizeString_ForSQL($data->passwordcheck);
                $req = $db->prepare('SELECT email,password FROM users WHERE id = ?');
                $req->execute(array($id));
                $user = $req->fetch();
                if (password_verify($password_check_tfa, $user['password'])) {
                    if ($tfa->verifyCode($tfa_secret, $tfa_code)) {
                        $req = $db->prepare('UPDATE users SET tfaKey = ? WHERE id = ?');
                        $req->execute(array($tfa_secret, $id));
                        sendMailTfaEnabled($user['email']);
                        header('Content-Type: application/json');
                        echo json_encode(array('success' => true, 'error' => false));
                    } else {
                        $error = 'Invalid 2FA code';
                    }
                } else {
                    $error = 'Invalid password';
                }
            }

            // Disable 2FA
            if (isset($data->passwordcheck)) {
                $password_check = SecurizeString_ForSQL($data->passwordcheck);
                $req = $db->prepare('SELECT email,password FROM users WHERE id = ?');
                $req->execute(array($id));
                $user = $req->fetch();
                if (password_verify($password_check, $user['password'])) {
                    $req = $db->prepare('UPDATE users SET tfaKey = NULL WHERE id = ?');
                    $req->execute(array($id));
                    sendMailTfaDisabled($user['email']);
                    header('Content-Type: application/json');
                    echo json_encode(array('success' => true, 'error' => false));
                } else {
                    $error = 'Invalid password';
                }
            }

            // Delete account
            if (isset($data->passwordCheckDelete)) {
                $password_check_delete = SecurizeString_ForSQL($data->passwordCheckDelete);
                $req = $db->prepare('SELECT password FROM users WHERE id = ?');
                $req->execute(array($id));
                $user = $req->fetch();
                if (password_verify($password_check_delete, $user['password'])) {
                    if (checkToken($token, $id)) {
                        $req = $db->prepare('DELETE FROM users WHERE id = ?');
                        $req->execute(array($id));
                        header('Content-Type: application/json');
                        echo json_encode(array('success' => true, 'error' => false));
                    } else {
                        $error = 'Invalid token';
                    }
                } else {
                    $error = 'Invalid password';
                }
            }
        } else {
            $error = 'Invalid token';
        }
    } else {
        $error = 'Invalid parameters';
    }
} else {
    $error = 'Invalid request method';
}

if (isset($error)) {
    header('Content-Type: application/json');
    echo json_encode(array('error' => true,'message' => $error));
}

?>