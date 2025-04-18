import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';
import { jwtDecode } from "jwt-decode";
import { MatSnackBar } from '@angular/material/snack-bar';
import { environment } from '../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiBaseUrl = `${environment.apiBaseUrl}/Auth`;
  private username: string = '';

  constructor(
    private http: HttpClient,
    private router: Router,
    private snackBar: MatSnackBar
  ) { }

  login(username: string, password: string) {
    return this.http.post<any>(`${this.apiBaseUrl}/login`, { username, password }).subscribe({
      next: (response) => {
        localStorage.setItem('access_token', response.accessToken);
        localStorage.setItem('refresh_token', response.refreshToken);
        this.setUsername(username);
        this.router.navigate(['dashboard']);
      },
      error: (err) => {
        console.error('Login error', err);
        this.snackBar.open('Login failed.', 'Close', {
          duration: 5000,
          horizontalPosition: 'center',
          verticalPosition: 'top'
        });
      }
    });
  }

  isTokenExpired(): boolean {
    const token = localStorage.getItem('access_token');
    if (!token) return true;

    const decoded: any = jwtDecode(token);
    const currentTime = Math.floor(Date.now() / 1000);
    return decoded.exp < currentTime;
  }

  refreshToken(): Observable<any> {
    return this.http.post<any>(`${this.apiBaseUrl}/refresh-token`, {
      refreshToken: localStorage.getItem('refresh_token')
    }).pipe(
      tap((response) => {
        localStorage.setItem('access_token', response.accessToken);
        localStorage.setItem('refresh_token', response.refreshToken);
      })
    );
  }

  register(username: string, password: string, invitationCode: string) {
    return this.http.post<any>(`${this.apiBaseUrl}/register`, { username, password, invitationCode }).subscribe({
      next: (response) => {
        console.log('Registration successful');
        this.snackBar.open('Registration successful. Please log in.', 'Close', {
          duration: 5000,
          horizontalPosition: 'center',
          verticalPosition: 'top'
        });
        this.router.navigate(['login']);
      },
      error: (err) => {
        console.error('Registration error', err);
        this.snackBar.open('Registration failed.', 'Close', {
          duration: 5000,
          horizontalPosition: 'center',
          verticalPosition: 'top'
        });
      }
    });
  }

  logout() {
    const refreshToken = localStorage.getItem('refresh_token');
    if (refreshToken) {
      this.http.post(`${this.apiBaseUrl}/logout`, { refreshToken }).subscribe({
        next: () => {
          console.log('Logout successful');
        },
        error: (err) => {
          console.error('Logout error', err);
        }
      });
    }

    // We tried, regardless of outcome we clear the tokens
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    this.router.navigate(['login']);
  }

  setUsername(username: string): void {
    this.username = username;
    localStorage.setItem('username', username);
  }

  getUsername(): string {
    if (!this.username) {
      this.username = localStorage.getItem('username') || '';
    }
    return this.username;
  }

  getRole(): string | null {
    const token = localStorage.getItem('access_token');
    if (!token) return null;

    try {
      const decodedToken: any = jwtDecode(token);
      return decodedToken['role'] || null;
    } catch (error) {
      console.error('Error decoding token', error);
      return null;
    }
  }

  getAccessToken(): string | null {
    return localStorage.getItem('access_token');
  }

  isLoggedIn(): boolean {
    return localStorage.getItem('access_token') !== null && !this.isTokenExpired();
  }

  isAdmin(): boolean {
    return this.isLoggedIn() && this.getRole() === 'Admin'
  }
}
