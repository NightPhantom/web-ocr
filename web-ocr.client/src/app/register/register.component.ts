import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css'],
  standalone: false
})
export class RegisterComponent {
  constructor(private authService: AuthService, private router: Router) { }

  onSubmit(form: any): void {
    const { username, password, invitation } = form.value;
    this.authService.register(username, password, invitation).subscribe({
      next: () => {
        alert('Registration successful');
        this.router.navigate(['/login']);
      },
      error: (err: any) => {
        console.error('Registration error', err);
        alert('Registration failed.');
      }
    });
  }
}
