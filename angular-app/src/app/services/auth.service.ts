import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Router } from '@angular/router';

/**
 * Auth service
 * 
 * This service is used to manage the authentication.
 */
@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:8000';
  private loggedIn = false;
  private user = {
    id: 0,
    token: '',
    tfa: false
  };

  /**
   * Constructor
   * 
   * @param http The HTTP client
   * @param router The router
   */
  constructor(private http: HttpClient, private router: Router) { 
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

  /**
   * Check login
   * 
   * It is used to check if the user is logged in.
   */
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

  /**
   * Login
   * 
   * It is used to login the user.
   * 
   * @param username The username
   * @param password The password
   * @param tfa_code The two-factor authentication code
   * @returns The response
   */
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

  /**
   * Register
   * 
   * It is used to register the user.
   * 
   * @param username The username
   * @param password The password
   * @param password2 The confirm password
   * @param pseudo The pseudo
   * @param firstname The first name
   * @param name The name
   * @param birthdate The birthdate
   * @returns The response
   */
  register(username: string, password: string, password2: string, pseudo: string, firstname: string, name: string, birthdate: Date): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/register.php`, { user: username, password: password, password2: password2, pseudo: pseudo, firstname: firstname, name: name, birthdate: birthdate });
  }

  /**
   * Logout
   * 
   * It is used to log out the user.
   */
  logout(): void {
    this.loggedIn = false;
    this.user.id = 0;
    this.user.token = '';
    this.user.tfa = false;
    sessionStorage.clear();
  }

  /**
   * Check if the user is logged in
   * 
   * @returns The result
   */
  isLoggedIn(): boolean {
    return this.loggedIn;
  }

  /**
   * Get the user
   * 
   * @returns The response
   */
  getUser(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/changeAccount.php?id=${this.user.id}&token=${this.user.token}`);
  }

  /**
   * Get the TFA secret
   * 
   * @returns The response
   */
  getTfaSecret(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/changeAccount.php?id=${this.user.id}&token=${this.user.token}&tfa=1`);
  }

  /**
   * Get the TFA status
   * 
   * @returns The TFA status
   */
  getTfa(): boolean {
    return this.user.tfa;
  }

  /**
   * Change the user information
   * 
   * @param pseudo The pseudo
   * @param firstname The first name
   * @param name The name
   * @param birthdate The birthdate
   * @returns The response
   */
  changeInfo(pseudo: string, firstname: string, name: string, birthdate: Date): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/changeAccount.php`, { id: this.user.id, token: this.user.token, pseudo: pseudo, firstname: firstname, name: name, birthdate: birthdate });
  }

  /**
   * Change the user password
   * 
   * @param oldPassword The old password
   * @param newPassword The new password
   * @param newPassword2 The confirm new password
   * @returns The response
   */
  changePassword(oldPassword: string, newPassword: string, newPassword2: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/changeAccount.php`, { id: this.user.id, token: this.user.token, oldpassword: oldPassword, newpassword: newPassword, newpasswordconfirm: newPassword2 });
  }

  /**
   * Enable TFA
   * 
   * @param tfa_code The TFA code
   * @param enablePassword The enable password
   * @param tfa_secret The TFA secret
   * @returns The response
   */
  enableTfa(tfa_code: string, enablePassword: string, tfa_secret: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/changeAccount.php`, { id: this.user.id, token: this.user.token, tfa_code: tfa_code, enablePassword: enablePassword, tfa_secret: tfa_secret});
  }

  /**
   * Disable TFA
   * 
   * @param disablePassword The disable password
   * @returns The response
   */
  disableTfa(disablePassword: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/changeAccount.php`, { id: this.user.id, token: this.user.token, disablePassword: disablePassword});
  }

  /**
   * Delete the account
   * 
   * @param password The password
   * @returns The response
   */
  deleteAccount(password: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/changeAccount.php`, { id: this.user.id, token: this.user.token, passwordCheckDelete: password });
  }
}
