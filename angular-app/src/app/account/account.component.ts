import { Component, OnInit } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { FormControl, FormGroup } from '@angular/forms';
import { NotificationService } from '../services/notification.service';

/**
 * Account component
 * 
 * This component is used to display the user account information and allow the user to change it.
 */
@Component({
  selector: 'app-account',
  templateUrl: './account.component.html',
  styleUrls: ['./account.component.css']
})
export class AccountComponent implements OnInit {
  user = {
    username: '',
    pseudo: '',
    firstname: '',
    name: '',
    birthdate: ''
  }
  tfa: boolean = false;
  tfa_secret: string = '';
  tfa_qrcode: string = '';

  changeInfoForm = new FormGroup({
    pseudo: new FormControl(''),
    firstname: new FormControl(''),
    name: new FormControl(''),
    birthdate: new FormControl('')
  })

  changePasswordForm = new FormGroup({
    oldPassword: new FormControl(''),
    newPassword: new FormControl(''),
    newPassword2: new FormControl('')
  })

  enableTfaForm = new FormGroup({
    tfa_code: new FormControl(''),
    enablePassword: new FormControl('')
  })

  disableTfaForm = new FormGroup({
    disablePassword: new FormControl('')
  })

  deleteAccountForm = new FormGroup({
    passwordDelete: new FormControl('')
  })

  /**
   * Constructor
   * 
   * @param authService The authentication service
   * @param notificationService The notification service
   */
  constructor(
    private authService: AuthService, 
    private notificationService: NotificationService
  ) {
    authService.getUser().subscribe(response => {
      if (response.success) {
        this.user.username = response.username;
        this.user.pseudo = response.pseudo;
        this.user.firstname = response.firstname;
        this.user.name = response.name;
        this.user.birthdate = response.birthdate;
        this.tfa = response.tfa_status;
      } else {
        this.notificationService.showNotification(response.message, 'error');
      }
    });
    this.tfa = authService.getTfa();
    if (!this.tfa) {
      authService.getTfaSecret().subscribe(response => {
        if (response.success) {
          this.tfa_secret = response.tfa_secret;
          this.tfa_qrcode = response.tfa_qrcode;
        } else {
          this.notificationService.showNotification(response.message, 'error');
        }
      });
    }
  }

  ngOnInit(): void {
  }

  /**
   * Change the user information
   */
  changeInfo(): void {
    const pseudo = this.changeInfoForm.get('pseudo')?.value;
    const firstname = this.changeInfoForm.get('firstname')?.value;
    const name = this.changeInfoForm.get('name')?.value;
    const birthdate = this.changeInfoForm.get('birthdate')?.value;

    this.authService.changeInfo(pseudo, firstname, name, birthdate).subscribe(response => {
      if (response.success) {
        this.user.pseudo = response.pseudo;
        this.user.firstname = response.firstname;
        this.user.name = response.name;
        this.user.birthdate = response.birthdate;
        this.notificationService.showNotification('Information Changed', 'info');
      } else {
        this.notificationService.showNotification(response.message, 'error');
      }
    });
  }

  /**
   * Change the user password
   */
  changePassword(): void {
    const oldPassword = this.changePasswordForm.get('oldPassword')?.value;
    const newPassword = this.changePasswordForm.get('newPassword')?.value;
    const newPassword2 = this.changePasswordForm.get('newPassword2')?.value;

    this.authService.changePassword(oldPassword, newPassword, newPassword2).subscribe(response => {
      if (response.success) {
        this.authService.logout();
        this.notificationService.showNotification('Password Changed', 'info');
      } else {
        this.notificationService.showNotification(response.message, 'error');
      }
    });
  }

  /**
   * Enable the Two-Factor Authentication
   */
  enableTfa(): void {
    const tfa_code = this.enableTfaForm.get('tfa_code')?.value;
    const enablePassword = this.enableTfaForm.get('enablePassword')?.value;
    const tfa_secret = this.tfa_secret;

    this.authService.enableTfa(tfa_code, enablePassword, tfa_secret).subscribe(response => {
      if (response.success) {
        this.authService.getUser().subscribe(response => {
          if (response.success) {
            this.user.username = response.username;
            this.user.pseudo = response.pseudo;
            this.user.firstname = response.firstname;
            this.user.name = response.name;
            this.user.birthdate = response.birthdate;
            this.tfa = response.tfa_status;
            this.notificationService.showNotification('2FA Enabled', 'info');
          } else {
            this.notificationService.showNotification(response.message, 'error');
          }
        });
      } else {
        this.notificationService.showNotification(response.message, 'error');
      }
    });
  }

  /**
   * Disable the Two-Factor Authentication
   */
  disableTfa(): void {
    const disablePassword = this.disableTfaForm.get('disablePassword')?.value;

    this.authService.disableTfa(disablePassword).subscribe(response => {
      if (response.success) {
        this.authService.getUser().subscribe(response => {
          if (response.success) {
            this.user.username = response.username;
            this.user.pseudo = response.pseudo;
            this.user.firstname = response.firstname;
            this.user.name = response.name;
            this.user.birthdate = response.birthdate;
            this.tfa = response.tfa_status;
            this.authService.getTfaSecret().subscribe(response => {
              if (response.success) {
                this.tfa_secret = response.tfa_secret;
                this.tfa_qrcode = response.tfa_qrcode;
              } else {
                this.notificationService.showNotification(response.message, 'error');
              }
            });
          } else {
            this.notificationService.showNotification(response.message, 'error');
          }
        });
        this.notificationService.showNotification('2FA Disabled', 'info');
      } else {
        this.notificationService.showNotification(response.message, 'error');
      }
    });
  }

  /**
   * Delete the user account
   */
  deleteAccount(): void {
    const password = this.deleteAccountForm.get('passwordDelete')?.value;

    this.authService.deleteAccount(password).subscribe(response => {
      if (response.success) {
        this.authService.logout();
        this.notificationService.showNotification('Account Deleted', 'info');
      } else {
        this.notificationService.showNotification(response.message, 'error');
      }
    });
  }

}
