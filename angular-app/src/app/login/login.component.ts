import { Component, OnInit } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';
import { AbstractControl, FormControl, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

  loginForm = new FormGroup({
    username: new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('', Validators.required),
    showPassword: new FormControl(false),
    //tfa_code: new FormControl('')
  });
  error_message: string = '';

  constructor(private authService: AuthService, private router: Router) { }

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

  onSubmit(): void {
    if (this.loginForm.valid) {
      const username = this.loginForm.get('username')?.value;
      const password = this.loginForm.get('password')?.value;

      this.authService.login(username, password).subscribe(response => {
        if (response.success) {
          this.router.navigate(['/home']);
        } else {
          this.error_message = response.message;
        }
      });
    }
  }

  togglePasswordVisibility(): void {
    const passwordField = document.getElementById('password') as HTMLInputElement;
    passwordField.type = this.showPassword?.value ? 'text' : 'password';
  }
}
