import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-account',
  templateUrl: './account.component.html',
  styleUrl: './account.component.css',
  standalone: false
})
export class AccountComponent implements OnInit {
  passwordChangeForm: FormGroup;
  username: string = '';
  isLoading = false;

  constructor(private formBuilder: FormBuilder, private authService: AuthService) {
    this.passwordChangeForm = this.formBuilder.group({
      oldPassword: ['', Validators.required],
      newPassword: ['', Validators.required],
      confirmPassword: ['', Validators.required]
    }, {
      validators: this.passwordMatchValidator
    });
  }

  ngOnInit(): void {
    this.username = this.authService.getUsername();
  }

  onChangePassword(form: any): void {
    if (this.passwordChangeForm.valid) {
      this.isLoading = true;
      const { oldPassword, newPassword, confirmPassword } = form.value;
      this.authService.changePassword(this.username, oldPassword, newPassword).add(() => {
        this.isLoading = false;
        this.passwordChangeForm.reset();
      });
    }
  }

  private passwordMatchValidator(control: AbstractControl): { [key: string]: boolean } | null {
    const newPassword = control.get('newPassword')?.value;
    const confirmPassword = control.get('confirmPassword')?.value;
    if (newPassword && confirmPassword && newPassword !== confirmPassword) {
      return { passwordMismatch: true };
    }
    return null;
  }
}
