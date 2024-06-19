import { Component, OnInit } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';
import { AbstractControl, FormControl, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent implements OnInit{
  registerForm = new FormGroup({
    username: new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('', Validators.required),
    password2: new FormControl('', Validators.required),
    pseudo: new FormControl('', Validators.required),
    avatar: new FormControl(''),
    firstname: new FormControl('', Validators.required),
    name: new FormControl('', Validators.required),
    birthdate: new FormControl('', Validators.required),
    showPassword: new FormControl(false)
  });
  error_message: string = '';

  constructor(private authService: AuthService, private router: Router) { }

  ngOnInit(): void { }

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
          this.router.navigate(['/login']);
        } else {
          this.error_message = response.message;
        }
      });
    }
  }

  togglePasswordVisibility(): void {
    const passwordField = document.getElementById('password') as HTMLInputElement;
    const password2Field = document.getElementById('password2') as HTMLInputElement;
    passwordField.type = this.showPassword?.value ? 'text' : 'password';
    password2Field.type = this.showPassword?.value ? 'text' : 'password';
  }
}
