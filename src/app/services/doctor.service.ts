import { HttpClient } from "@angular/common/http";
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

    getAllDoctors(){
        return this.http.get<Doctor[]>(`${this.apiUrl}`);
    }

    getDoctorById(id: number){
        return this.http.get<Doctor>(`${this.apiUrl}/${id}`);
    }

    saveDoctor(doctor:Doctor){
        return this.http.post<Doctor>(`${this.apiUrl}`, doctor);
    }

     editDoctor(doctor:Doctor){
         return this.http.put<Doctor>(`${this.apiUrl}/${doctor.id}`, doctor);
     }

    deleteDoctor(id:number){
        return this.http.delete<void>(`${this.apiUrl}/${id}`);
    }

    getMyAppointments(){
        return this.http.get<Appointment[]>(`${this.apiUrl}`);
    }

    getPendingAppointments(): Observable<any[]> {
        return this.http.get<any[]>(`${this.appointmentUrl}/pending`);
    }

    approuveAppointment(appointmentId: number): Observable<Appointment> {
        return this.http.put<Appointment>(`${this.appointmentUrl}/${appointmentId}/approve`, {});
    }

     rejectAppointment(appointmentId: number): Observable<Appointment> {
    return this.http.put<Appointment>(`${this.appointmentUrl}/${appointmentId}/reject`, {});
  }

  getAppointmentStats(): Observable<any> {
    return this.http.get<any>(`${this.appointmentUrl}/stats`);
  }
  
  verifyDoctorRelationships(): Observable<any> {
    return this.http.get<any>(`${this.appointmentUrl}/verify-relationships`);
  }
  
  debugCurrentDoctor(): Observable<any> {
    return this.http.get<any>(`${this.appointmentUrl}/debug`);
  }
}