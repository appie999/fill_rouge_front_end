import { Routes } from '@angular/router';
import { HomeComponent } from './component/home/home.component';
import { AboutUsComponent } from './component/about-us/about-us.component';
import { LoginComponent } from './component/login/login.component';
import { RegisterComponent } from './component/register/register.component';
import { DoctorDashboardComponent } from './component/doctor-dashboard/doctor-dashboard.component';
import { PatientDashboardComponent } from './component/patient-dashboard/patient-dashboard.component';
import { BookAppointmentComponent } from './component/book-appointment/book-appointment.component';

export const routes: Routes = [

    { path: 'home', component: HomeComponent },
    { path: 'about', component: AboutUsComponent },


    { path: 'auth/login', component: LoginComponent },
    { path: 'auth/register', component: RegisterComponent },
    { path: 'book-appointment', component: BookAppointmentComponent },

         {path: 'doctor/dashboard',component: DoctorDashboardComponent},
          {path: 'patient/dashboard',component: PatientDashboardComponent },


  { path: '', redirectTo: 'home', pathMatch: 'full' },
  { path: '**', redirectTo: 'home' },

];
