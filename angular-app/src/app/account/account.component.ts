import { Component, OnInit } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { AbstractControl, FormControl, FormGroup, ValidatorFn, Validators } from '@angular/forms';
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
    pseudo: new FormControl('', Validators.pattern(/^[a-zA-Z0-9_\-\u00C0-\u017F]{1,32}$/)),
    firstname: new FormControl('', Validators.pattern(/^[a-zA-Z_\-\u00C0-\u017F]{1,32}$/)),
    name: new FormControl('', Validators.pattern(/^[a-zA-Z_\-\u00C0-\u017F]{1,32}$/)),
    birthdate: new FormControl('', Validators.required)
  })

  changePasswordForm = new FormGroup({
    oldPassword: new FormControl('', Validators.required),
    newPassword: new FormControl('', [Validators.required, this.passwordValidator]),
    newPassword2: new FormControl('', Validators.required)
  }, { validators: this.passwordMatchValidator('newPassword', 'newPassword2') });

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

  get pseudo(): AbstractControl | null {
    return this.changeInfoForm.get('pseudo');
  }

  get firstname(): AbstractControl | null {
    return this.changeInfoForm.get('firstname');
  }

  get name(): AbstractControl | null {
    return this.changeInfoForm.get('name');
  }

  get birthdate(): AbstractControl | null {
    return this.changeInfoForm.get('birthdate');
  }

  get oldPassword(): AbstractControl | null {
    return this.changePasswordForm.get('oldPassword');
  }

  get newPassword(): AbstractControl | null {
    return this.changePasswordForm.get('newPassword');
  }

  get newPassword2(): AbstractControl | null {
    return this.changePasswordForm.get('newPassword2');
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
   * Password validator
   * 
   * It is used to validate the password entered by the user.
   * 
   * @param control The form control
   * @returns The validation result
   */
  passwordValidator(control: AbstractControl): { [key: string]: any } | null {
    const value = control.value;
    if (!value) return null;
    const validLength = value.length >= 12;
    const hasUppercase = /[A-Z]/.test(value);
    const hasDigit = /\d/.test(value);
    const hasSpecial = /[!@#$%^&*(),.?":{}|<>/\-_]/.test(value);
    const isValid = validLength && hasUppercase && hasDigit && hasSpecial;
    return isValid ? null : { invalidPassword: true };
  }

  /**
   * Password match validator
   * 
   * It is used to check if the password and confirm password fields match.
   * 
   * @param password The password field
   * @param confirmPassword The confirm password field
   * @returns The validation result
   */
  passwordMatchValidator(password: string, confirmPassword: string): ValidatorFn {
    return (control: AbstractControl): { [key: string]: boolean } | null => {
      const passwordControl = control.get(password);
      const confirmPasswordControl = control.get(confirmPassword);

      if (passwordControl && confirmPasswordControl && passwordControl.value !== confirmPasswordControl.value) {
        confirmPasswordControl.setErrors({ passwordMismatch: true });
        return { passwordMismatch: true };
      } else {
        return null;
      }
    };
  }

  /**
   * Check password criteria
   * 
   * It is used to check the password criteria.
   * 
   * @returns The password criteria
   */
  checkPasswordCriteria(): { [key: string]: boolean } {
    const password = this.newPassword?.value || '';
    return {
      validLength: password.length >= 12,
      hasUppercase: /[A-Z]/.test(password),
      hasDigit: /\d/.test(password),
      hasSpecial: /[!@#$%^&*(),.?":{}|<>-_]/.test(password)
    };
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
