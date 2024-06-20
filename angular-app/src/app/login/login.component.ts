import { Component, OnInit } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';
import { AbstractControl, FormControl, FormGroup, Validators } from '@angular/forms';
import { NotificationService } from '../services/notification.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

  loginForm = new FormGroup({
    username: new FormControl('', [Validators.required, Validators.pattern(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/)]),
    password: new FormControl('', Validators.required),
    showPassword: new FormControl(false),
    tfa_code: new FormControl('')
  });
  tfa: boolean = false;
  error_message: string = '';

  constructor(private authService: AuthService, private router: Router, private notificationService: NotificationService) { }

  ngOnInit(): void { }

  get username(): AbstractControl | null {
    return this.loginForm.get('username');
  }

  get password(): AbstractControl | null {
    return this.loginForm.get('password');
  }

  get showPassword(): AbstractControl | null {
    return this.loginForm.get('showPassword');
  }

  get tfa_code(): AbstractControl | null {
    return this.loginForm.get('tfa_code');
  }

  onSubmit(): void {
    if (this.loginForm.valid) {
      const username = this.loginForm.get('username')?.value;
      const password = this.loginForm.get('password')?.value;
      const tfa_code = this.loginForm.get('tfa_code')?.value;

      this.authService.login(username, password, tfa_code).subscribe(response => {
        if (response.success) {
          this.notificationService.showNotification(response.message, 'success');
          this.router.navigate(['/home']);
        } else if (response.tfa) {
          this.tfa = true;
          this.loginForm.get('tfa_code')?.setValidators([Validators.required, Validators.pattern(/^[0-9]{6}$/)]);
          this.loginForm.get('tfa_code')?.updateValueAndValidity();
        } else {
          this.notificationService.showNotification(response.message, 'error');
        }
      });
    }
  }

  togglePasswordVisibility(): void {
    const passwordField = document.getElementById('password') as HTMLInputElement;
    passwordField.type = this.showPassword?.value ? 'text' : 'password';
  }

}
