import { Component } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  username: string = '';
  password: string = '';

  constructor(private authService: AuthService, private router: Router) { }

  login() {
    this.authService.login(this.username, this.password).subscribe(response => {
      if (response.success) {
        // Rediriger vers la page d'accueil après une connexion réussie
        this.router.navigate(['/home']);
      } else {
        alert(response.message);
      }
    });
  }
}
