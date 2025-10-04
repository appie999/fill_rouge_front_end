import { Routes } from '@angular/router';
import { HomeComponent } from './component/home/home.component';
import { AboutUsComponent } from './component/about-us/about-us.component';
import { LoginComponent } from './component/login/login.component';
import { DoctorDashboardComponent } from './component/doctor-dashboard/doctor-dashboard.component';
// import { RegisterComponent } from './component/register/register.component';

export const routes: Routes = [

    { path: 'home', component: HomeComponent },
    { path: 'about', component: AboutUsComponent },


    { path: 'auth/login', component: LoginComponent },
    // { path: 'auth/register', component: RegisterComponent },

         {path: 'doctor/dashboard',component: DoctorDashboardComponent},
        // {path: 'doctor/patients',component: PatientsComponent,canActivate: [authGuard, doctorGuard]},
        //   {path: 'patient/dashboard',component: PatientDashboardComponent,canActivate: [authGuard, patientGuard] },


  { path: '', redirectTo: 'home', pathMatch: 'full' },
  { path: '**', redirectTo: 'home' },

];
