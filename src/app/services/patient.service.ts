import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

export interface Patient {
  id?: number;
  name: string;
  email: string;
  dob: string; // Date of Birth
  medicalHistory: string;
}

export interface Doctor {
  id: number;
  name: string;
  speciality: string;
}

@Injectable({
  providedIn: 'root'
})
export class PatientService {
  private apiUrl = 'http://localhost:8080/patient';
  private base = 'http://localhost:8080/patient/appointments';

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

  getAllPatients(): Observable<Patient[]> {
    return this.http.get<Patient[]>(`${this.apiUrl}`);
  }

  getPatientById(id: number): Observable<Patient> {
    return this.http.get<Patient>(`${this.apiUrl}/${id}`);
  }

  savePatient(patient: Patient): Observable<Patient> {
    return this.http.post<Patient>(`${this.apiUrl}/`, patient);
  }

  editPatient(id: number, patient: Patient): Observable<Patient> {
    return this.http.put<Patient>(`${this.apiUrl}/${id}`, patient);
  }

  deletePatient(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  bookAppointment(p:{ doctorId:number; date:string; reason?:string }) {
    console.log('PatientService: Booking appointment to:', `${this.base}`);
    return this.http.post(`${this.base}`, p, { headers: this.getAuthHeaders() });
  }

  getDoctorsNames(): Observable<any[]> {
    return this.http.get<any[]>("http://localhost:8080/doctor/doctor-names", { headers: this.getAuthHeaders() });
  }

  getDoctors(): Observable<any[]> {
    return this.http.get<any[]>("http://localhost:8080/doctor/doctor-names", { headers: this.getAuthHeaders() });
  }

  // Get patient's appointments
  getMyAppointments(): Observable<any[]> {
    console.log('PatientService: Fetching appointments from:', `${this.base}`);
    return this.http.get<any[]>(`${this.base}`, { headers: this.getAuthHeaders() });
  }

  // Cancel appointment
  cancelAppointment(appointmentId: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/${appointmentId}`, { headers: this.getAuthHeaders() });
  }
}
