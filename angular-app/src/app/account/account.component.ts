import { Component, OnInit } from '@angular/core';
import { AuthService } from '../services/auth.service';

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

  constructor(authService: AuthService) { 
    authService.getUser().subscribe(response => {
      if (response.success) {
        this.user.username = response.username;
        this.user.pseudo = response.pseudo;
        this.user.firstname = response.firstname;
        this.user.name = response.name;
        this.user.birthdate = response.birthdate;
      } else {
        console.log(response.message);
      }
    });
  }

  ngOnInit(): void {
  }

}
