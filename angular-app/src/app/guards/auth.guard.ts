import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

/**
 * Auth Guard
 * 
 * This guard is used to protect routes that require authentication.
 */
@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  /**
   * Constructor
   * 
   * @param authService The authentication service
   * @param router The router
   */
  constructor(
    private authService: AuthService, 
    private router: Router
  ) { }

  /**
   * Can activate
   * 
   * It is used to check if the user is logged in and can access the route.
   * 
   * @returns True if the user is logged in, false otherwise
   */
  canActivate(): boolean {
    if (this.authService.isLoggedIn()) {
      return true;
    } else {
      this.router.navigate(['/login']);
      return false;
    }
  }

}
