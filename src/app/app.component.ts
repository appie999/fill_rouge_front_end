import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { DoctorDashboardComponent } from "./component/doctor-dashboard/doctor-dashboard.component";
import { PatientDashboardComponent } from "./component/patient-dashboard/patient-dashboard.component";

@Component({
  selector: 'app-root',
  imports: [ PatientDashboardComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'clinique';
}
