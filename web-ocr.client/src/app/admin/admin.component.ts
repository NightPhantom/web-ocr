import { Component, OnInit } from '@angular/core';
import { AuthService } from '../auth.service';
import { Clipboard } from '@angular/cdk/clipboard';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-admin',
  templateUrl: './admin.component.html',
  styleUrl: './admin.component.css',
  standalone: false
})

export class AdminComponent implements OnInit {
  private baseUrl = 'https://localhost:7063/api/Admin';
  username: string = '';
  isAdmin: boolean = false;

  constructor(private authService: AuthService, private clipboard: Clipboard, private http: HttpClient) { }

  ngOnInit(): void {
    this.username = this.authService.getUsername();
    this.isAdmin = this.authService.isAdmin();
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
}
