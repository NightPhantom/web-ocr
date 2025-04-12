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
      error: (error) => {
        console.error('Login error', error);
        alert('Login failed.');
      }
    });
  }

  register(username: string, password: string, invitation: string): Observable<any> {
    return this.http.post(`${this.baseUrl}/register`, { username, password, invitation });
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
  }

  getUsername(): string {
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
