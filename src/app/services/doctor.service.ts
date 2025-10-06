import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { AuthServiceService } from "./auth-service";

export interface Doctor {
    id: number;
  firstName: string;
  lastName: string;
  userName: string;
    email: string;
  specialty: string;
}

export interface Appointment {
  id: number;
  date: string;
  status: string;
  patientId: number;
  doctorId: number;
  patientName?: string;
  patientEmail?: string;
}

@Injectable({
  providedIn: 'root'
})
export class DoctorService {

  private apiUrl = "http://localhost:8080/doctor";
  private appointmentUrl = "http://localhost:8080/doctor/appointment";

    constructor(private http: HttpClient, private auth: AuthServiceService) { }

    // Get authentication headers
    private getAuthHeaders(): HttpHeaders {
        const token = localStorage.getItem('token');
        if (token) {
            return new HttpHeaders({
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            });
        }
        return new HttpHeaders({
            'Content-Type': 'application/json'
        });
    }

    // Public endpoint for getting all doctors (for appointment booking)
    getAllDoctors() : Observable<Doctor[]> {
        // Use a public endpoint that doesn't require authentication
        return this.http.get<Doctor[]>(`${this.apiUrl}`);
    }

    getDoctorById(id: number){
        return this.http.get<Doctor>(`${this.apiUrl}/${id}`, { headers: this.getAuthHeaders() });
    }

    saveDoctor(doctor:Doctor){
        return this.http.post<Doctor>(`${this.apiUrl}`, doctor, { headers: this.getAuthHeaders() });
    }

     editDoctor(doctor:Doctor){
         return this.http.put<Doctor>(`${this.apiUrl}/${doctor.id}`, doctor, { headers: this.getAuthHeaders() });
     }

    deleteDoctor(id:number){
        return this.http.delete<void>(`${this.apiUrl}/${id}`, { headers: this.getAuthHeaders() });
    }

    getMyAppointments(){
        return this.http.get<Appointment[]>(`${this.apiUrl}`, { headers: this.getAuthHeaders() });
    }

    getPendingAppointments(): Observable<any[]> {
        return this.http.get<any[]>(`${this.appointmentUrl}/pending?email=${this.auth.getEmail()}`, { headers: this.getAuthHeaders() });
    }

    approuveAppointment(appointmentId: number): Observable<Appointment> {
        return this.http.put<Appointment>(`${this.appointmentUrl}/${appointmentId}/approve?email=${this.auth.getEmail()}`, {}, { headers: this.getAuthHeaders() });
    }

     rejectAppointment(appointmentId: number): Observable<Appointment> {
        return this.http.put<Appointment>(`${this.appointmentUrl}/${appointmentId}/reject?email=${this.auth.getEmail()}`, {}, { headers: this.getAuthHeaders() });
    }

    getAppointmentStats(): Observable<any> {
        return this.http.get<any>(`${this.appointmentUrl}/stats?email=${this.auth.getEmail()}`, { headers: this.getAuthHeaders() });
    }
  
    verifyDoctorRelationships(): Observable<any> {
        return this.http.get<any>(`${this.appointmentUrl}/verify-relationships?email=${this.auth.getEmail()}`, { headers: this.getAuthHeaders() });
    }
  
    debugCurrentDoctor(): Observable<any> {
        return this.http.get<any>(`${this.appointmentUrl}/debug?email=${this.auth.getEmail()}`, { headers: this.getAuthHeaders() });
    }
}