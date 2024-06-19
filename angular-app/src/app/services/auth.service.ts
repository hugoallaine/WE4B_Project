import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:8000'; // URL de votre backend PHP
  private loggedIn = false;
  private user = {
    id: 0,
    token: '',
  };

  constructor(private http: HttpClient) {
    this.checkSession();
  }

  login(username: string, password: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/login.php`, { user: username, password: password }).pipe(
      tap(response => {
        if (response.success) {
          this.loggedIn = true;
          this.user.id = response.id;
          this.user.token = response.token;
        }
      })
    );
  }

  register(username: string, password: string, password2: string, pseudo: string, firstname: string, name: string, birthdate: Date): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/register.php`, { user: username, password: password, password2: password2, pseudo: pseudo, firstname: firstname, name: name, birthdate: birthdate });
  }

  logout(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/logout.php`).pipe(
      tap(() => {
        this.loggedIn = false;
        this.user.id = 0;
        this.user.token = '';
      })
    );
  }

  isLoggedIn(): boolean {
    return this.loggedIn;
  }

  private checkSession() {
    this.http.get<any>(`${this.apiUrl}/checkSession.php`).subscribe(response => {
      this.loggedIn = response.status;
      console.log(this.loggedIn)
    });
  }

  getUser(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/changeAccount.php?id=${this.user.id}&token=${this.user.token}`);
  }
}
