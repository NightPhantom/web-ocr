import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})

export class AuthRedirectGuard implements CanActivate {

  constructor(private authService: AuthService, private router: Router) { }

  canActivate(): boolean {
    if (this.authService.isLoggedIn()) {
      // User is logged in, redirect to dashboard
      this.router.navigate(['/dashboard']);
      return false;
    }

    // User is not logged in
    return true;
  }
}
