import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { PatientService } from '../../services/patient.service';
import { AuthServiceService } from '../../services/auth-service';
import { DoctorService } from '../../services/doctor.service';
import { VavbarComponent } from '../navbar/vavbar.component';

interface Doctor {
  id: number;
  name: string;
  specialization: string; // Note: using 'specialization' to match backend
}

@Component({
  selector: 'app-book-appointment',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, VavbarComponent],
  templateUrl: './book-appointment.component.html',
  styleUrl: './book-appointment.component.css'
})
export class BookAppointmentComponent implements OnInit {

  form!: FormGroup;

  loading = false;
  loadingDoctors = false;
  error = '';
  success = '';
  result: any | null = null;
  doctors: any[] = [];


  constructor(private fb: FormBuilder, private api: PatientService, private auth: AuthServiceService, private doctorService: DoctorService, public router: Router) {
    this.form = this.fb.group({
      doctorId: [null, Validators.required],
      date: ['', Validators.required],
      reason: ['', Validators.required]
    });
  }
  
  ngOnInit(): void {
    this.doctorService.getAllDoctors().subscribe({
      next: (doctors: any[]) => { this.doctors = doctors;
        console.log('Doctors loaded on init:', this.doctors);
      },
      error: (err: any) => { console.error('Error loading doctors on init:', err); }  
      
    }); // Preload doctors
    this.getDoctors();
    // Check if user is logged in
    if (!this.auth.isLoggedIn()) {
      this.error = 'Vous devez être connecté pour réserver un rendez-vous.';
      this.router.navigate(['/auth/login']);
      return;
    }

    // Check if user is a patient
    const token = localStorage.getItem('token');
    const userRole = this.auth.getRole(token);
    if (userRole !== 'PATIENT') {
      this.error = 'Seuls les patients peuvent réserver des rendez-vous.';
      this.router.navigate(['/home']);
      return;
    }

    this.getDoctors();
    
    // Set minimum date to today
    const today = new Date().toISOString().split('T')[0];
    setTimeout(() => {
      const dateInput = document.getElementById('date') as HTMLInputElement;
      if (dateInput) {
        dateInput.min = today;
      }
    }, 100);
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.error = 'Veuillez remplir tous les champs obligatoires.';
      return;
    }

    // Validate date is not in the past
    const selectedDate = new Date(this.form.value.date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (selectedDate < today) {
      this.error = 'La date du rendez-vous doit être aujourd\'hui ou dans le futur.';
      return;
    }

    this.loading = true;
    this.error = '';
    this.success = '';
    this.result = null;

    const selectedDoctor = this.doctors.find(d => d.id == this.form.value.doctorId);
    const payload = {
      doctorId: Number(this.form.value.doctorId),
      date: this.form.value.date,
      reason: this.form.value.reason
    };

    console.log('Booking appointment with payload:', payload);
    console.log('Selected doctor:', selectedDoctor);
    console.log('Current user token:', localStorage.getItem('token') ? 'Present' : 'Missing');
    this.api.bookAppointment(payload).subscribe({
      next: (res: any) => { 
        console.log('Appointment booked successfully:', res);
        this.result = res;
        this.success = `Rendez-vous réservé avec succès! Vous avez un rendez-vous avec ${selectedDoctor?.name || 'le médecin'} le ${this.formatDate(res.date)}. Votre demande est en attente d'approbation.`;
        this.form.reset();
        
        // Auto-redirect to dashboard after 3 seconds
        setTimeout(() => {
          this.router.navigate(['/patient/dashboard']);
        }, 3000);
      },             
      error: (err: any) => { 
        console.error('Booking error:', err);
        if (err.status === 400) {
          this.error = 'Données invalides. Veuillez vérifier vos informations.';
        } else if (err.status === 401) {
          this.error = 'Vous devez être connecté pour réserver un rendez-vous.';
        } else if (err.status === 404) {
          this.error = 'Médecin introuvable. Veuillez sélectionner un autre médecin.';
        } else {
          this.error = 'Erreur lors de la réservation: ' + (err.error?.message || err.message || 'Erreur inconnue');
        }
      },
      complete: () => { this.loading = false; }              
    });
  }

  getDoctors(): void {
    this.loadingDoctors = true;
    console.log('Loading doctors from database...');
    
    // First try the public endpoint
    this.doctorService.getAllDoctors().subscribe({
      next: (doctors: any[]) => {
        this.handleDoctorsSuccess(doctors);
      },
      error: (err: any) => {
        console.log('Public endpoint failed, trying authenticated endpoint:', err);
        // If public endpoint fails, try with the patient service endpoint
        this.api.getDoctors().subscribe({
          next: (doctors: any[]) => {
            this.handleDoctorsSuccess(doctors);
          },
          error: (err2: any) => {
            console.error('Both endpoints failed:', err2);
            this.handleDoctorsError(err2);
          }
        });
      },
      complete: () => {
        this.loadingDoctors = false;
      }
    });
  }

  private handleDoctorsSuccess(doctors: any[]): void {
    console.log('Doctors loaded from database:', doctors);
    
    // Map the doctor data to match our interface
    this.doctors = doctors.map(doctor => ({
      id: doctor.id,
      name: doctor.name,
      speciality: doctor.specialization || doctor.speciality // Handle both field names
    }));
    
    console.log('Mapped doctors for display:', this.doctors);
    
    if (this.doctors.length === 0) {
      console.warn('No doctors found in database');
      this.error = 'Aucun médecin disponible pour le moment.';
    }
    this.loadingDoctors = false;
  }

  private handleDoctorsError(err: any): void {
    console.error('Error loading doctors from database:', err);
    
    if (err.status === 401) {
      this.error = 'Veuillez vous connecter pour voir la liste des médecins.';
    } else if (err.status === 403) {
      this.error = 'Accès refusé. Veuillez vous connecter en tant que patient.';
    } else if (err.status === 500) {
      this.error = 'Erreur serveur. Veuillez réessayer plus tard.';
    } else {
      this.error = 'Impossible de charger la liste des médecins. Veuillez vous connecter.';
    }
    this.loadingDoctors = false;
  }

  formatDate(dateString: string): string {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR');
  }

  clearMessages(): void {
    this.error = '';
    this.success = '';
  }

  // Helper method to get formatted doctor names for display
  getDoctorNamesString(): string {
    return this.doctors.map(d => d.name).join(', ');
  }

}

