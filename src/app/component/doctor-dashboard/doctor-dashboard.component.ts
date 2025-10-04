import { Component } from '@angular/core';
import { VavbarComponent } from "../navbar/vavbar.component";
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthServiceService } from '../../services/auth-service';
import { DoctorService } from '../../services/doctor.service';

@Component({
  selector: 'app-doctor-dashboard',
  standalone: true,
  imports: [VavbarComponent,CommonModule, RouterModule],
  templateUrl: './doctor-dashboard.component.html',
  styleUrl: './doctor-dashboard.component.css'
})
export class DoctorDashboardComponent {

  username : string = '';
  menuOpen = false;

  todayAppointments = 0;
  pendingAppointments = 0;
  newLabResults = 3;
  totalPatients = 45;

  appointments: any[] = [];
  pendingRequests: any[] = [];
  loading = false;
  error = '';
  successMessage = '';


  recentPrescriptions = [
    {
      patient: 'Dupont, Jean',
      medication: 'Amoxicilline 500mg',
      date: '15/03/2025',
      status: 'Active',
      statusClass: 'green'
    },
    {
      patient: 'Bernard, Sophia',
      medication: 'Ibuprofène 400mg',
      date: '14/03/2025',
      status: 'Terminée',
      statusClass: 'gray'
    }
  ];

  Role = localStorage.getItem('role');

  isDoctor(): boolean {
    return this.Role === "DOCTOR";
  }

   constructor(private auth: AuthServiceService, private doctorService: DoctorService) {}

  logout() {
    this.auth.logout();
  }

   ngOnInit(): void {
    this.username = this.auth.getUserName() || 'Docteur';
    console.log('Doctor Dashboard initialized for:', this.username);
    console.log('User role:', this.Role);
    
    this.loadAppointments();
    this.loadPendingRequests();
    this.loadStats();
    
    // Add debug verification for Dr. Farid specifically
    if (this.username && this.username.toLowerCase().includes('farid')) {
      console.log('🔍 Dr. Farid detected - enabling enhanced debugging');
      this.debugDoctorRelationships();
    }
  }

  debugDoctorRelationships(): void {
    console.log('Debugging doctor-patient relationships...');
  }

  loadAppointments(): void {
    this.loading = true;
    this.doctorService.getMyAppointments().subscribe({
      next: (appointments: any[]) => {
        this.appointments = appointments.filter(a => a.status === 'APPROVED');
        console.log('Doctor appointments:', this.appointments);
      },
      error: (err: any) => {
        console.error('Error loading appointments:', err);
        this.error = 'Failed to load appointments';
      },
      complete: () => {
        this.loading = false;
      }
    });
  }


  loadPendingRequests(): void {
    console.log('Loading pending requests for doctor...');
    this.doctorService.getPendingAppointments().subscribe({
      next: (pending: any[]) => {
        console.log('Raw pending appointments response:', pending);
        
        this.pendingRequests = pending.map(apt => {
          console.log('Processing appointment:', apt);
          
          const mappedRequest = {
            id: apt.id,
            dateTime: this.formatDate(apt.date),
            patient: apt.patientName || `Patient ${apt.patientId}`,
            patientEmail: apt.patientEmail || '',
            reason: 'Demande en ligne',
            appointmentData: apt
          };
          
          console.log('Mapped request:', mappedRequest);
          return mappedRequest;
        });
        
        this.pendingAppointments = pending.length;
        console.log('Final pending requests:', this.pendingRequests);
        console.log('Pending appointments count:', this.pendingAppointments);
        
        // If no pending requests found for Dr. Farid, log additional debug info
        if (pending.length === 0) {
          console.warn('No pending appointments found! This might indicate:');
          console.warn('1. Doctor authentication issue');
          console.warn('2. No appointments booked for this doctor');
          console.warn('3. All appointments already approved/rejected');
          console.warn('Check backend logs for doctor authentication details');
        }
      },
      error: (err: any) => {
        console.error('Error loading pending requests:', err);
        console.error('Error status:', err.status);
        console.error('Error message:', err.message);
        console.error('Full error object:', err);
        
        if (err.status === 403) {
          this.error = 'Accès refusé. Problème d\'authentification du médecin.';
          console.error('Doctor authentication failed - email mismatch likely');
        } else if (err.status === 500) {
          this.error = 'Erreur serveur lors du chargement des demandes.';
        } else {
          this.error = 'Erreur lors du chargement des demandes en attente.';
        }
        
        // Auto-clear error after 5 seconds
        setTimeout(() => {
          this.error = '';
        }, 5000);
      }
    });
  }

  loadStats(): void {
    this.doctorService.getAppointmentStats().subscribe({
      next: (stats: any) => {
        this.todayAppointments = stats.totalAppointments || 0;
        this.pendingAppointments = stats.pendingAppointments || 0;
        console.log('Appointment stats:', stats);
      },
      error: (err: any) => {
        console.error('Error loading stats:', err);
      }
    });
  }

  toggleMobileMenu() {
    this.menuOpen = !this.menuOpen;
  }

    closeMobileMenu() {
    this.menuOpen = false;
  }

  approveAppointment(id: number) {
    if (!confirm('Voulez-vous approuver ce rendez-vous?')) {
      return;
    }
    
    this.doctorService.approuveAppointment(id).subscribe({
      next: (approved) => {
        console.log('Appointment approved:', approved);
        this.successMessage = 'Rendez-vous approuvé avec succès! ✅';
        this.loadPendingRequests(); // Refresh the list
        this.loadAppointments();
        this.loadStats();
        
        // Clear success message after 3 seconds
        setTimeout(() => {
          this.successMessage = '';
        }, 3000);
      },
      error: (err: any) => {
        console.error('Error approving appointment:', err);
        this.error = 'Erreur lors de l\'approbation du rendez-vous';
        setTimeout(() => {
          this.error = '';
        }, 3000);
      }
    });
  }

   rejectAppointment(id: number) {
    if (!confirm('Voulez-vous rejeter ce rendez-vous?')) {
      return;
    }
    
    this.doctorService.rejectAppointment(id).subscribe({
      next: (rejected) => {
        console.log('Appointment rejected:', rejected);
        this.successMessage = 'Rendez-vous rejeté. ❌';
        this.loadPendingRequests(); // Refresh the list
        this.loadStats();
        
        // Clear success message after 3 seconds
        setTimeout(() => {
          this.successMessage = '';
        }, 3000);
      },
      error: (err: any) => {
        console.error('Error rejecting appointment:', err);
        this.error = 'Erreur lors du rejet du rendez-vous';
        setTimeout(() => {
          this.error = '';
        }, 3000);
      }
    });
  }

  viewPatientDetails(patientId: string) {
    // In real app, navigate to patient details
    console.log('View patient details:', patientId);
  }

  addConsultationNotes(appointmentId: string) {
    // In real app, open consultation notes modal
    console.log('Add consultation notes:', appointmentId);
  }

  formatDate(dateString: string): string {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR');
  }

  getStatusClass(status: string): string {
    switch(status?.toLowerCase()) {
      case 'approved': return 'green';
      case 'pending': return 'blue';
      case 'rejected': return 'red';
      default: return 'gray';
    }
  }

}
