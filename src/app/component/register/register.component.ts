import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Form, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthServiceService } from '../../services/auth-service';
import { Route, Router } from '@angular/router';
import { VavbarComponent } from "../navbar/vavbar.component";

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, VavbarComponent],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css'
})
export class RegisterComponent {

  form !: FormGroup;
  error = '';
  loading = false;

  constructor(private fb: FormBuilder, private auth: AuthServiceService, private router: Router) { 
    this.form = this.fb.group({
      FirstName: ['',Validators.required],
      LastName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
      role: ['']
    });
  }

}
