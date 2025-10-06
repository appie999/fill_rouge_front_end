import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { VavbarComponent } from '../navbar/vavbar.component';
import { AuthServiceService } from '../../services/auth-service';
import { PatientService } from '../../services/patient.service';

@Component({
  selector: 'app-patient-dashboard',
  standalone:true,
  imports: [CommonModule, RouterModule, VavbarComponent],
  templateUrl: './patient-dashboard.component.html',
  styleUrl: './patient-dashboard.component.css'
})
export class PatientDashboardComponent implements OnInit {

  userName = '';
  menuOpen = false;
  appointments: any[] = [];
  loading = false;
  error = '';
  successMessage = '';
  
  // KPI properties
  upcomingAppointments = 0;
  monthlyAppointments = 0;
  lastVisit = 'N/A';

  Role = localStorage.getItem("role");

  isAdmin():boolean{
    if(this.Role=="PATIENT"){
      return true;
    }else{
      return false;
    }
  }

  constructor(public auth: AuthServiceService, private patientService: PatientService, private router: Router) {}

  logout(){
    this.auth.logout();
  }

  // Mobile menu methods
  toggleMobileMenu() {
    this.menuOpen = !this.menuOpen;
  }

  closeMobileMenu(){
    this.menuOpen = false;
  }

  ngOnInit(): void {
    this.userName = this.auth.getUserName() || 'Patient';
   this.loadAppointments();
    this.calculateKPIs();
  }

  // Calculate KPI values
  calculateKPIs(): void {
    // These would normally come from backend API calls
    this.upcomingAppointments = this.appointments.filter(apt => 
      apt.status === 'APPROVED' && new Date(apt.date) > new Date()
    ).length;
    
    this.monthlyAppointments = this.appointments.filter(apt => {
      const aptDate = new Date(apt.date);
      const now = new Date();
      return aptDate.getMonth() === now.getMonth() && aptDate.getFullYear() === now.getFullYear();
    }).length;
    
    // Find last visit
    const pastAppointments = this.appointments.filter(apt => 
      apt.status === 'APPROVED' && new Date(apt.date) < new Date()
    );
    if (pastAppointments.length > 0) {
      const lastApt = pastAppointments.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];
      this.lastVisit = this.formatDate(lastApt.date);
    }
  }

  loadAppointments(): void {
    this.loading = true;
    this.error = ''; // Clear previous errors
    
    console.log('Loading appointments for patient...');
    this.patientService.getMyAppointments(this.auth.getEmail()).subscribe({
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
        
        // Recalculate KPIs after loading appointments
        this.calculateKPIs();
        
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
          this.successMessage = 'Rendez-vous annulé avec succès!';
          this.error = '';
          this.loadAppointments(); // Reload appointments
          
          // Clear success message after 3 seconds
          setTimeout(() => {
            this.successMessage = '';
          }, 3000);
        },
        error: (err: any) => {
          console.error('Failed to cancel appointment:', err);
          this.error = 'Erreur lors de l\'annulation: ' + (err.error?.message || err.message);
          this.successMessage = '';
        }
      });
    }
  }

  // Quick action methods
  viewMedicalHistory(): void {
    // Navigate to medical history page or show modal
    console.log('Viewing medical history...');
    // this.router.navigate(['/patient/medical-history']);
  }

  contactSupport(): void {
    // Open support contact modal or navigate to support page
    console.log('Contacting support...');
    // this.router.navigate(['/support']);
  }
}
