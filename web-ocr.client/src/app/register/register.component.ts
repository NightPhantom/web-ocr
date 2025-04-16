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
  constructor(private formBuilder: FormBuilder, private route: ActivatedRoute, private authService: AuthService) {
    this.registrationForm = this.formBuilder.group({
      username: ['', Validators.required],
      password: ['', Validators.required],
      invitation: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      const invitationCode = params['invitation'];
      if (invitationCode) {
        this.registrationForm.get('invitation')?.setValue(invitationCode);
      }
    });
  }

  onRegister(form: any): void {
    if (this.registrationForm.valid) {
      const { username, password, invitation } = form.value;
      this.authService.register(username, password, invitation);
    }
  }
}
