import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthServiceService } from '../../services/auth-service';
import { Router, RouterModule } from '@angular/router';
import { VavbarComponent } from "../navbar/vavbar.component";
import { RegisterRequest, AuthResponse } from '../../model/auth.model';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule, VavbarComponent],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css'
})
export class RegisterComponent {

  form !: FormGroup;
  error = '';
  loading = false;

  constructor(private fb: FormBuilder, private auth: AuthServiceService, private router: Router) { 
    this.form = this.fb.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      userName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      role: ['PATIENT', Validators.required] // Default to PATIENT with required validation
    });
  }

  onSubmit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.error = 'Veuillez remplir tous les champs obligatoires.';
      this.loading = false; // Reset loading state for invalid forms
      return;
    }

    this.loading = true;
    this.error = '';

    const registerData: RegisterRequest = {
      firstName: this.form.value.firstName,
      lastName: this.form.value.lastName,
      userName: this.form.value.userName,
      email: this.form.value.email,
      password: this.form.value.password,
      role: this.form.value.role
    };

    console.log('Registration Data:', registerData);

    this.auth.register(registerData).subscribe({
      next: (res: AuthResponse) => {
        console.log('Registration successful:', res);
        this.auth.saveAuthData(res.token);
        
        // Get user role and redirect accordingly
        const userRole = this.auth.getRole(res.token);
        console.log('User role after registration:', userRole);
        
        if (userRole === 'DOCTOR') {
          this.router.navigate(['/doctor/dashboard']);
        } else if (userRole === 'PATIENT') {
          this.router.navigate(['/patient/dashboard']);
        } else {
          // Fallback to home if role is not recognized
          this.router.navigate(['/home']);
        }
      },
      error: (errorResponse) => {
        console.error('Registration error:', errorResponse);
        if (errorResponse.error && typeof errorResponse.error === 'string') {
          this.error = errorResponse.error;
        } else if (errorResponse.error && errorResponse.error.message) {
          this.error = errorResponse.error.message;
        } else if (errorResponse.status === 409) {
          this.error = 'Un compte avec cet email existe déjà.';
        } else if (errorResponse.status === 0) {
          this.error = 'Impossible de se connecter au serveur. Veuillez vérifier votre connexion réseau.';
        } else {
          this.error = 'Erreur lors de l\'inscription. Veuillez réessayer.';
        }
        this.loading = false;
      },
      complete: () => {
        this.loading = false;
      }
    });
  }

}
