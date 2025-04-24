import { Component, OnInit } from '@angular/core';
import { AuthService } from '../auth.service';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css'],
  standalone: false
})
export class RegisterComponent implements OnInit {
  registrationForm: FormGroup;
  isLoading = false;

  constructor(private formBuilder: FormBuilder, private route: ActivatedRoute, private authService: AuthService) {
    this.registrationForm = this.formBuilder.group({
      username: ['', Validators.required],
      password: ['', Validators.required],
      invitationCode: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      const invitationCode = params['invitation'];
      if (invitationCode) {
        this.registrationForm.get('invitationCode')?.setValue(invitationCode);
      }
    });
  }

  onRegister(form: any): void {
    if (this.registrationForm.valid) {
      this.isLoading = true;
      const { username, password, invitationCode } = form.value;
      this.authService.register(username, password, invitationCode).add(() => {
        this.isLoading = false;
      })
    }
  }
}
