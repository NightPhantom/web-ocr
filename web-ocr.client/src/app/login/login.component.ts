import { Component } from '@angular/core';
import { AuthService } from '../auth.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
  standalone: false
})
export class LoginComponent {
  loginForm: FormGroup;
  isLoading = false;

  constructor(private formBuilder: FormBuilder, private authService: AuthService) {
    this.loginForm = this.formBuilder.group({
      username: ['', Validators.required],
      password: ['', Validators.required]
    });
  }

  onLogin(form: any): void {
    if (this.loginForm.valid) {
      this.isLoading = true;
      const { username, password } = form.value;
      this.authService.login(username, password).add(() => {
        this.isLoading = false;
      });
    }
  }
}
