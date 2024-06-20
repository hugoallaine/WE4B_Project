import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:8000'; // URL de votre backend PHP
  private loggedIn = false;
  private user = {
    id: 0,
    token: '',
    tfa: false
  };

  constructor(private http: HttpClient, private router: Router) { 
    console.log(sessionStorage.getItem('id'), sessionStorage.getItem('token'));
    this.checkLogin().subscribe(response => {
      if (response.success) {
        this.loggedIn = true;
        if (this.loggedIn) {
          this.getUser().subscribe(response => {
            this.user.tfa = response.tfa;
            router.navigate(['/home']);
          });
        }
      }
    });
  }

  checkLogin(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/checkSession.php?id=${parseInt(sessionStorage.getItem('id') ?? '0')}&token=${sessionStorage.getItem('token') ?? ''}`).pipe(
      tap(response => {
        if (response.success) {
          this.loggedIn = true;
          this.user.id = response.id;
          this.user.token = response.token;
        }
      })
    );
  }

  login(username: string, password: string, tfa_code: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/login.php`, { user: username, password: password, tfa_code: tfa_code}).pipe(
      tap(response => {
        if (response.success) {
          this.loggedIn = true;
          this.user.id = response.id;
          this.user.token = response.token;
          this.user.tfa = response.tfa;
          sessionStorage.setItem('id', response.id);
          sessionStorage.setItem('token', response.token);
        }
      })
    );
  }

  register(username: string, password: string, password2: string, pseudo: string, firstname: string, name: string, birthdate: Date): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/register.php`, { user: username, password: password, password2: password2, pseudo: pseudo, firstname: firstname, name: name, birthdate: birthdate });
  }

  logout(): void {
    this.loggedIn = false;
    this.user.id = 0;
    this.user.token = '';
    this.user.tfa = false;
    sessionStorage.clear();
  }

  isLoggedIn(): boolean {
    return this.loggedIn;
  }

  getUser(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/changeAccount.php?id=${this.user.id}&token=${this.user.token}`);
  }

  getTfaSecret(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/changeAccount.php?id=${this.user.id}&token=${this.user.token}&tfa=1`);
  }

  getTfa(): boolean {
    return this.user.tfa;
  }

  changeInfo(pseudo: string, firstname: string, name: string, birthdate: Date): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/changeAccount.php`, { id: this.user.id, token: this.user.token, pseudo: pseudo, firstname: firstname, name: name, birthdate: birthdate });
  }

  changePassword(oldPassword: string, newPassword: string, newPassword2: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/changeAccount.php`, { id: this.user.id, token: this.user.token, oldpassword: oldPassword, newpassword: newPassword, newpasswordconfirm: newPassword2 });
  }

  enableTfa(tfa_code: string, enablePassword: string, tfa_secret: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/changeAccount.php`, { id: this.user.id, token: this.user.token, tfa_code: tfa_code, enablePassword: enablePassword, tfa_secret: tfa_secret});
  }

  disableTfa(disablePassword: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/changeAccount.php`, { id: this.user.id, token: this.user.token, disablePassword: disablePassword});
  }

  deleteAccount(password: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/changeAccount.php`, { id: this.user.id, token: this.user.token, passwordCheckDelete: password });
  }
}
