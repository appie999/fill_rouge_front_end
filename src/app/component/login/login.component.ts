import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthServiceService } from '../../services/auth-service';
import { Router, RouterModule } from '@angular/router';
import { AuthResponse } from '../../model/auth.model';
import { CommonModule } from '@angular/common';
import { VavbarComponent } from "../navbar/vavbar.component";
@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, RouterModule, VavbarComponent],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent implements OnInit {

  form: FormGroup;
  error = '';
  loading = false;


  ngOnInit(): void {
    if (this.auth.isLoggedIn()) {
      this.router.navigate(['/home']);
    }
  }

  constructor( private fb: FormBuilder, private auth:AuthServiceService,private router:Router) {
    this.form = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });
  }

  onSubmit() {

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.error = 'Veuillez remplir tous les champs obligatoires.';
      return; 
    }

    this.loading = true;
    this.error = '';

    const { email, password } = this.form.value;

    console.log('Form Values:', this.form.value);

    this.auth.login(email, password).subscribe({
      next: (res: AuthResponse) => {
        this.auth.saveAuthData(res.token);
        
        // Get user role and redirect accordingly
        const userRole = this.auth.getRole(res.token);
        console.log('User role:', userRole);
        
        if (userRole === 'DOCTOR') {
          this.router.navigate(['/doctor/dashboard']);
        } else if (userRole === 'PATIENT') {
          this.router.navigate(['/patient/dashboard']);
        } else {
          this.router.navigate(['/home']);
        }
      },
      error: (errorReponse)  => {
        console.error('Login error:', errorReponse);
        if(errorReponse.error && typeof errorReponse.error === 'string'){
          this.error  = errorReponse.error;
        }else if (errorReponse.error && errorReponse.error.message){
          this.error = errorReponse.error.message;
        }else if (errorReponse.status === 401) {
          this.error = 'Email ou mot de passe incorrect.';
        }else if (errorReponse.status === 0) {
          this.error = 'Impossible de se connecter au serveur. Veuillez vérifier votre connexion réseau.';
        }else {
          this.error = 'Erreur lors de la connexion. Veuillez réessayer.'
        }
        },
        complete: () => (this.loading = false),
    });
  }
}

