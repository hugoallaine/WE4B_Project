<?php
use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;
require_once dirname(__FILE__).'/vendor/PHPMailer/src/PHPMailer.php';
require_once dirname(__FILE__).'/vendor/PHPMailer/src/Exception.php';
require_once dirname(__FILE__).'/vendor/PHPMailer/src/SMTP.php';
require_once dirname(__FILE__).'/json.php';

/**
 * Function to send an email
 * @param string $destinataire
 * @param string $sujet
 * @param string $message
 */
function sendMail($destinataire, $sujet, $message) {
    global $json;
    $mail = new PHPMailer(true);
    try {
        $mail->isSMTP();
        $mail->Host = $json['mailserver'];
        $mail->SMTPAuth = true;
        $mail->Username = $json['SMTP_user'];
        $mail->Password = $json['SMTP_password'];
        $mail->SMTPSecure = PHPMailer::ENCRYPTION_SMTPS;
        $mail->Port = $json['SMTP_port'];
        $mail->setFrom($json['SMTP_user'], 'YGreg');
        $mail->addAddress($destinataire);
        $mail->addReplyTo($json['SMTP_noreply'],'No-Reply');
        $mail->isHTML(true);
        $mail->Subject = mb_encode_mimeheader($sujet, 'UTF-8');
        $mail->Body = $message;
        $mail->send();
    } catch (Exception $e) {
        echo "Message could not be sent. Mailer Error: {$mail->ErrorInfo}";
    }
}

/**
 * Function to send a confirmation email
 * @param string $destinataire
 * @param string $confirmkey
 */
function sendMailConfirm($destinataire, $confirmkey) {
    $parent_folder = dirname($_SERVER['SCRIPT_NAME']);
    $validator_path = ($parent_folder === '/') ? 'validator.php' : $parent_folder . '/validator.php';
    $confirm_link = 'http://' . $_SERVER['HTTP_HOST'] . $validator_path;
    $sujet = "Confirmation de votre compte YGreg";
    $message = '
    <html>
    <head>
        <meta charset="utf-8">
        <title>Confirmation de votre compte YGreg</title>
    </head>
    <body>
        <h1>V&eacute;rification de votre adresse email - YGreg</h1>
        <p>Bonjour, veuillez confirmer votre compte en cliquant sur le lien suivant : <a href="'.$confirm_link.'?email='.urlencode($destinataire).'&key='.urlencode($confirmkey).'">Confirmer</a></p>
        <p>Si vous n\'&ecirc;tes pas &agrave; l\'origine de cette action, merci d\'ignorer ce mail.</p>
    </body>
    </html>
    ';
    sendMail($destinataire, $sujet, $message);
}

// A voir plus tard
function sendMailReset($destinataire, $resetkey) {
    $parent_folder = dirname($_SERVER['SCRIPT_NAME']);
    $validator_path = ($parent_folder === '/') ? 'validator.php' : $parent_folder . '/validator.php';
    $confirm_link = 'http://' . $_SERVER['HTTP_HOST'] . $validator_path;
    $sujet = "Réinitialisation de votre mot de passe YGreg";
    $message = '
    <html>
    <head>
        <meta charset="utf-8">
        <title>R&eacute;initialisation de votre mot de passe YGreg</title>
    </head>
    <body>
        <h1>R&eacute;initialisation de votre mot de passe - YGreg</h1>
        <p>Bonjour, veuillez r&eacute;initialiser votre mot de passe en cliquant sur le lien suivant : <a href="'.$confirm_link.'?email='.urlencode($destinataire).'&key='.urlencode($resetkey).'">Réinitialiser</a></p>
        <p>Si vous n\'&ecirc;tes pas &agrave; l\'origine de cette action, merci d\'ignorer ce mail.</p>
    </body>
    </html>
    ';
    sendMail($destinataire, $sujet, $message);
}

/**
 * Function to send an email to notify the user that 2FA has been enabled
 * @param string $destinataire
 */
function sendMailTfaEnabled($destinataire) {
    $sujet = "Activation de l'authentification à deux facteurs YGreg";
    $message = '
    <html>
    <head>
        <meta charset="utf-8">
        <title>Activation de l\'authentification &agrave; deux facteurs YGreg</title>
    </head>
    <body>
        <h1>Activation de l\'authentification &agrave; deux facteurs - YGreg</h1>
        <p>Bonjour, l\'authentification &agrave; deux facteurs a bien &eacute;t&eacute; activ&eacute;e sur votre compte.</p>
        <p>Si vous n\'&ecirc;tes pas &agrave; l\'origine de cette action, merci de contacter le support.</p>
    </body>
    </html>
    ';
    sendMail($destinataire, $sujet, $message);
}

/**
 * Function to send an email to notify the user that 2FA has been disabled
 * @param string $destinataire
 */
function sendMailTfaDisabled($destinataire) {
    $sujet = "Désactivation de l'authentification à deux facteurs YGreg";
    $message = '
    <html>
    <head>
        <meta charset="utf-8">
        <title>Désactivation de l\'authentification &agrave; deux facteurs YGreg</title>
    </head>
    <body>
        <h1>D&eacute;sactivation de l\'authentification &agrave; deux facteurs - YGreg</h1>
        <p>Bonjour, l\'authentification &agrave; deux facteurs a bien &eacute;t&eacute; d&eacute;sactiv&eacute;e sur votre compte.</p>
        <p>Si vous n\'&ecirc;tes pas &agrave; l\'origine de cette action, merci de contacter le support.</p>
    </body>
    </html>
    ';
    sendMail($destinataire, $sujet, $message);
}
?>