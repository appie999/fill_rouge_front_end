import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { VavbarComponent } from '../navbar/vavbar.component';
import { AuthServiceService } from '../../services/auth-service';
import { PatientService } from '../../services/patient.service';

@Component({
  selector: 'app-patient-dashboard',
  standalone:true,
  imports: [CommonModule, RouterModule, VavbarComponent],
  templateUrl: './patient-dashboard.component.html',
  styleUrl: '././patient-dashboard.component.html'
})
export class PatientDashboardComponent implements OnInit {

  userName = '';
  menuOpen = false;
  appointments: any[] = [];
  loading = false;
  error = '';

  Role = localStorage.getItem("role");

  isAdmin():boolean{
    if(this.Role=="PATIENT"){
      return true;
    }else{
      return false;
    }
  }

  constructor(public auth: AuthServiceService, private patientService: PatientService) {}

  logout(){
    this.auth.logout();
  }

  ngOnInit(): void {
    this.userName = this.auth.getUserName() || 'Patient';
    this.loadAppointments();
  }

  loadAppointments(): void {
    this.loading = true;
    this.error = ''; // Clear previous errors
    
    console.log('Loading appointments for patient...');
    this.patientService.getMyAppointments().subscribe({
      next: (appointments: any[]) => {
        this.appointments = appointments || [];
        console.log('Patient appointments loaded:', appointments);
        
        // Enhance appointments with doctor names
        this.appointments = this.appointments.map(apt => ({
          ...apt,
          doctorName: `Dr. ${apt.doctorId}`, // Simple doctor name for now
          statusText: this.getStatusText(apt.status),
          dateFormatted: this.formatDate(apt.date)
        }));
        
        if (this.appointments.length === 0) {
          console.log('No appointments found for this patient');
        }
      },
      error: (err: any) => {
        console.error('Error loading appointments:', err);
        console.error('Error details:', {
          status: err.status,
          message: err.message,
          error: err.error
        });
        
        if (err.status === 401) {
          this.error = 'Authentication required. Please login again.';
        } else if (err.status === 403) {
          this.error = 'Access denied. Please check your patient role.';
        } else if (err.status === 500) {
          this.error = 'Server error. Please try again later.';
        } else {
          this.error = `Failed to load appointments (Error ${err.status || 'Unknown'})`;
        }
      },
      complete: () => {
        this.loading = false;
        console.log('Appointment loading completed');
      }
    });
  }

  getStatusClass(status: string): string {
    switch(status?.toLowerCase()) {
      case 'approved': return 'green';
      case 'pending': return 'blue';
      case 'rejected': return 'red';
      default: return 'gray';
    }
  }

  getStatusText(status: string): string {
    switch(status?.toLowerCase()) {
      case 'approved': return 'Approuvé';
      case 'pending': return 'En attente';
      case 'rejected': return 'Rejeté';
      default: return status || 'Inconnu';
    }
  }

  formatDate(dateString: string): string {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR');
  }


  // Cancel appointment
  cancelAppointment(appointmentId: number): void {
    if (confirm('Voulez-vous vraiment annuler ce rendez-vous?')) {
      this.patientService.cancelAppointment(appointmentId).subscribe({
        next: () => {
          console.log('Appointment cancelled successfully');
          alert('Rendez-vous annulé avec succès!');
          this.loadAppointments(); // Reload appointments
        },
        error: (err: any) => {
          console.error('Failed to cancel appointment:', err);
          alert('Erreur lors de l\'annulation: ' + (err.error?.message || err.message));
        }
      });
    }
  }
}
