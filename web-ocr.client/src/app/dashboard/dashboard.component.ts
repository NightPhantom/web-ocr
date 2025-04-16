import { Component, OnInit } from '@angular/core';
import { AuthService } from '../auth.service';
import { HttpClient } from '@angular/common/http';
import { Clipboard } from '@angular/cdk/clipboard';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css',
  standalone: false
})
export class DashboardComponent implements OnInit {
  private baseUrl = 'https://localhost:7063/api/OCR';
  username: string = '';
  isAdmin: boolean = false;
  selectedFile: File | null = null;
  selectedImage: string | null = null;
  ocrResponse: { text: string } | null = null;

  constructor(private authService: AuthService, private http: HttpClient, private clipboard: Clipboard) { }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedFile = input.files[0];

      const reader = new FileReader();
      reader.onload = (e: ProgressEvent<FileReader>) => {
        this.selectedImage = e.target?.result as string;
      };
      reader.readAsDataURL(this.selectedFile);
    }
  }

  uploadImage(): void {
    if (!this.selectedFile) return;

    const formData = new FormData();
    formData.append('image', this.selectedFile);

    this.http.post<{ text: string }>(`${this.baseUrl}/process-image`, formData).subscribe({
      next: (response) => {
        this.ocrResponse = response;
      },
      error: (err) => {
        console.error('Error processing image.', err);
        this.ocrResponse = { text: 'Error processing the image.' };
      }
    });
  }

  ngOnInit(): void {
    this.username = this.authService.getUsername();
    this.isAdmin = this.authService.getRole() === 'admin';
  }

  generateInvitation(): void {
    this.authService.generateInvitation();
  }

  copyToClipboard(text: string): void {
    this.clipboard.copy(text);
  }
}
