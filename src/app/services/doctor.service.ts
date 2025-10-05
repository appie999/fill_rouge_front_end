import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";

export interface Doctor {
  id?: number;
  name: string;
  specialization: string;
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
  private appointmentUrl = "http://localhost:8080/appointment";

    constructor(private http: HttpClient) { }

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
    getAllDoctors(){
        // Use a public endpoint that doesn't require authentication
        return this.http.get<Doctor[]>(`${this.apiUrl}/public/all`);
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
        return this.http.get<any[]>(`${this.appointmentUrl}/pending`, { headers: this.getAuthHeaders() });
    }

    approuveAppointment(appointmentId: number): Observable<Appointment> {
        return this.http.put<Appointment>(`${this.appointmentUrl}/${appointmentId}/approve`, {}, { headers: this.getAuthHeaders() });
    }

     rejectAppointment(appointmentId: number): Observable<Appointment> {
        return this.http.put<Appointment>(`${this.appointmentUrl}/${appointmentId}/reject`, {}, { headers: this.getAuthHeaders() });
    }

    getAppointmentStats(): Observable<any> {
        return this.http.get<any>(`${this.appointmentUrl}/stats`, { headers: this.getAuthHeaders() });
    }
  
    verifyDoctorRelationships(): Observable<any> {
        return this.http.get<any>(`${this.appointmentUrl}/verify-relationships`, { headers: this.getAuthHeaders() });
    }
  
    debugCurrentDoctor(): Observable<any> {
        return this.http.get<any>(`${this.appointmentUrl}/debug`, { headers: this.getAuthHeaders() });
    }
}