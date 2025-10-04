import { HttpClient } from '@angular/common/http';
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
  private apiUrl = 'http://localhost:8081/patient';
  private base = 'http://localhost:8081/api/patient/';

  constructor(private http: HttpClient) { }

  getAllPatients(): Observable<Patient[]> {
    return this.http.get<Patient[]>(`${this.apiUrl}/`);
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

  bookAppointment(p:{ doctorId:number; date:string }) {
    console.log('PatientService: Booking appointment to:', `${this.base}appointments`);
    return this.http.post(`${this.base}appointments`, p);
  }

  getDoctorsNames(): Observable<any[]> {
    return this.http.get<any[]>("http://localhost:8081/doctor/doctor-names");
  }

  getDoctors(): Observable<any[]> {
    return this.http.get<any[]>("http://localhost:8081/doctor/doctor-names");
  }

  // Get patient's appointments
  getMyAppointments(): Observable<any[]> {
    console.log('PatientService: Fetching appointments from:', `${this.base}appointments`);
    return this.http.get<any[]>(`${this.base}appointments`);
  }

  // Cancel appointment
  cancelAppointment(appointmentId: number): Observable<void> {
    return this.http.delete<void>(`${this.base}appointments/${appointmentId}`);
  }
}
