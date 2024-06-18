import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:8000'; // URL de votre backend PHP
  private loggedIn = false;

  constructor(private http: HttpClient) {
    this.checkSession();
  }

  login(username: string, password: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/login.php`, { user: username, password: password }).pipe(
      tap(response => {
        if (response.success) {
          this.loggedIn = true;
        }
      })
    );
  }

  register(username: string, password: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/register.php`, { user: username, password: password });
  }

  logout(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/logout.php`).pipe(
      tap(() => {
        this.loggedIn = false;
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
}
