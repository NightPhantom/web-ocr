import { Component, OnInit } from '@angular/core';
import { AuthService } from '../auth.service';
import { HttpClient } from '@angular/common/http';
import { MatDialog } from '@angular/material/dialog';
import { InvitationDialogComponent } from '../invitation-dialog/invitation-dialog.component';
import { MatSnackBar } from '@angular/material/snack-bar';
import { environment } from '../../environments/environment';

@Component({
  selector: 'app-admin',
  templateUrl: './admin.component.html',
  styleUrl: './admin.component.css',
  standalone: false
})

export class AdminComponent implements OnInit {
  private apiBaseUrl = `${environment.apiBaseUrl}/Admin`;
  username: string = '';
  isAdmin: boolean = false;

  constructor(
    private authService: AuthService,
    private http: HttpClient,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) { }

  ngOnInit(): void {
    this.username = this.authService.getUsername();
    this.isAdmin = this.authService.isAdmin();
  }

  generateInvitation(): void {
    const registrationUrl = 'https://localhost:51241/register'
    this.http.post<{ invitationCode: string }>(`${this.apiBaseUrl}/generate-invitation`, {}).subscribe({
      next: (response) => {
        console.log('Generated Invitation Code:', response.invitationCode);
        this.dialog.open(InvitationDialogComponent, {
          data: { invitationCode: `${registrationUrl}?invitation=${response.invitationCode}` }
        });
      },
      error: (error) => {
        console.error('Error generating invitation code:', error);
        this.snackBar.open('Error generating invitation code.', 'Close', {
          duration: 5000,
          horizontalPosition: 'center',
          verticalPosition: 'top'
        });
      }
    });
  }
}
