import { Component, OnInit } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';
import { AbstractControl, FormControl, FormGroup, ValidatorFn, Validators } from '@angular/forms';
import { NotificationService } from '../services/notification.service';

/**
 * Register component
 * 
 * This component is used to display the register form.
 */
@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent implements OnInit {
  registerForm = new FormGroup({
    username: new FormControl('', [Validators.required, Validators.pattern(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/)]),
    password: new FormControl('', [Validators.required, this.passwordValidator]),
    password2: new FormControl('', Validators.required),
    pseudo: new FormControl('', [Validators.required, Validators.pattern(/^[a-zA-Z0-9_\-\u00C0-\u017F]{1,32}$/)]),
    avatar: new FormControl(''),
    firstname: new FormControl('', [Validators.required, Validators.pattern(/^[a-zA-Z_\-\u00C0-\u017F]{1,32}$/)]),
    name: new FormControl('', [Validators.required, Validators.pattern(/^[a-zA-Z_\-\u00C0-\u017F]{1,32}$/)]),
    birthdate: new FormControl('', Validators.required),
    showPassword: new FormControl(false)
  }, { validators: this.passwordMatchValidator('password', 'password2') });
  error_message: string = '';

  /**
   * Constructor
   * 
   * @param authService The auth service
   * @param router The router
   * @param notificationService The notification service
   */
  constructor(
    private authService: AuthService, 
    private router: Router, 
    private notificationService: NotificationService
  ) { }

  ngOnInit(): void { }

  /**
   * Getters for form controls
   */
  get username(): AbstractControl | null {
    return this.registerForm.get('username');
  }

  get password(): AbstractControl | null {
    return this.registerForm.get('password');
  }

  get password2(): AbstractControl | null {
    return this.registerForm.get('password2');
  }

  get pseudo(): AbstractControl | null {
    return this.registerForm.get('pseudo');
  }

  get firstname(): AbstractControl | null {
    return this.registerForm.get('firstname');
  }

  get name(): AbstractControl | null {
    return this.registerForm.get('name');
  }

  get birthdate(): AbstractControl | null {
    return this.registerForm.get('birthdate');
  }

  get showPassword(): AbstractControl | null {
    return this.registerForm.get('showPassword');
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
    const hasSpecial = /[!@#$%^&*(),.?":{}|<>-_]/.test(value);
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
   * Submit the form
   */
  onSubmit(): void {
    if (this.registerForm.valid) {
      const username = this.registerForm.get('username')?.value;
      const password = this.registerForm.get('password')?.value;
      const password2 = this.registerForm.get('password2')?.value;
      const pseudo = this.registerForm.get('pseudo')?.value;
      const firstname = this.registerForm.get('firstname')?.value;
      const name = this.registerForm.get('name')?.value;
      const birthdate = this.registerForm.get('birthdate')?.value;

      this.authService.register(username, password, password2, pseudo, firstname, name, birthdate).subscribe(response => {
        if (response.success) {
          this.notificationService.showNotification(response.message, 'success');
          this.router.navigate(['/login']);
        } else {
          this.notificationService.showNotification(response.message, 'error');
        }
      });
    }
  }

  /**
   * Toggle password visibility
   */
  togglePasswordVisibility(): void {
    const passwordField = document.getElementById('password') as HTMLInputElement;
    const password2Field = document.getElementById('password2') as HTMLInputElement;
    passwordField.type = this.showPassword?.value ? 'text' : 'password';
    password2Field.type = this.showPassword?.value ? 'text' : 'password';
  }

  /**
   * Check password criteria
   * 
   * It is used to check the password criteria.
   * 
   * @returns The password criteria
   */
  checkPasswordCriteria(): { [key: string]: boolean } {
    const password = this.password?.value || '';
    return {
      validLength: password.length >= 12,
      hasUppercase: /[A-Z]/.test(password),
      hasDigit: /\d/.test(password),
      hasSpecial: /[!@#$%^&*(),.?":{}|<>-_]/.test(password)
    };
  }
}
