import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { jwtDecode } from "jwt-decode";

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private baseUrl = 'https://localhost:7063/api/Auth';
  private username: string = '';

  constructor(private http: HttpClient, private router: Router) { }

  login(username: string, password: string) {
    return this.http.post<any>(`${this.baseUrl}/login`, { username, password }).subscribe({
      next: (response) => {
        localStorage.setItem('access_token', response.token);
        this.setUsername(username);
        this.router.navigate(['dashboard']);
      },
      error: (err) => {
        console.error('Login error', err);
        alert('Login failed.');
      }
    });
  }

  register(username: string, password: string, invitation: string) {
    return this.http.post<any>(`${this.baseUrl}/register`, { username, password, invitation }).subscribe({
      next: (response) => {
        alert('Registration successful');
        this.router.navigate(['login']);
      },
      error: (err) => {
        console.error('Registration error', err);
        alert('Registration failed.');
      }
    });
  }

  generateInvitation(): void {
    this.http.post<{ invitationCode: string }>(`${this.baseUrl}/generate-invitation`, {}).subscribe({
      next: (response) => {
        console.log('Generated Invitation Code:', response.invitationCode);
        alert(`Invitation Code: ${response.invitationCode}`);
      },
      error: (error) => {
        console.error('Error generating invitation code:', error);
        alert('Failed to generate invitation code.');
      },
      complete: () => {
        console.log('Invitation generation request completed.');
      }
    });
  }

  logout() {
    localStorage.removeItem('access_token');
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

  public get loggedIn(): boolean {
    return localStorage.getItem('access_token') !== null;
  }
}
