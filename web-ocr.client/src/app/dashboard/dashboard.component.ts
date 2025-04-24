import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { AuthService } from '../auth.service';
import { HttpClient } from '@angular/common/http';
import { Clipboard } from '@angular/cdk/clipboard';
import { MatSnackBar } from '@angular/material/snack-bar';
import { environment } from '../../environments/environment';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css',
  standalone: false
})
export class DashboardComponent implements OnInit {
  private apiBaseUrl = `${environment.apiBaseUrl}/OCR`;
  username: string = '';
  selectedFile: File | null = null;
  selectedImage: string | null = null;
  ocrResponse: { text: string } | null = null;
  @ViewChild('resultContainer') resultContainer!: ElementRef;
  isAnalyzing: boolean = false;

  constructor(
    private authService: AuthService,
    private http: HttpClient,
    private clipboard: Clipboard,
    private snackBar: MatSnackBar
  ) { }

  ngOnInit(): void {
    this.username = this.authService.getUsername();
  }

  onFileSelected(event: Event): void {
    this.ocrResponse = null;
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
    this.ocrResponse = null;
    if (!this.selectedFile) return;

    this.isAnalyzing = true;

    const formData = new FormData();
    formData.append('image', this.selectedFile);

    this.http.post<{ text: string }>(`${this.apiBaseUrl}/process-image`, formData).subscribe({
      next: (response) => {
        this.ocrResponse = response;
        setTimeout(() => {
          this.resultContainer?.nativeElement.scrollIntoView({ behavior: 'smooth' });
        }, 1);
      },
      error: (err) => {
        console.error('Error processing image.', err);
        this.ocrResponse = { text: 'Error processing the image.' };
      },
      complete: () => {
        this.isAnalyzing = false;
      }
    });
  }

  copyToClipboard(text: string, confirmationMessage: string): void {
    if (this.clipboard.copy(text)) {
      this.snackBar.open(confirmationMessage, 'Close', {
        duration: 3000,
        horizontalPosition: 'center',
        verticalPosition: 'top'
      });
    }
  }
}
