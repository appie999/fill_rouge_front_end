import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthServiceService } from '../../services/auth-service'; 
import { Router, RouterModule } from '@angular/router';
import { Subscription } from 'rxjs';
@Component({
  selector: 'app-vavbar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './vavbar.component.html',
  styleUrl: './vavbar.component.css'
})
export class VavbarComponent implements OnInit, OnDestroy {

  menuOpen = false;
  token = localStorage.getItem('token');
  isAuthenticated = false;


  private authSubscription?: Subscription;

  constructor(public auth: AuthServiceService, private router: Router) {}

   showAuthButtons: boolean = true;

   hideAuthButtons() {
    this.showAuthButtons = false;
  }

  ngOnInit() {
    // Subscribe to authentication state changes
    this.authSubscription = this.auth.isAuthenticated$.subscribe(
      (isAuth) => {
        this.isAuthenticated = isAuth;
        this.token = localStorage.getItem('token'); // Update token when auth state changes
      }
    );
  }

  ngOnDestroy() {
    // Clean up subscription to prevent memory leaks
    if (this.authSubscription) {
      this.authSubscription.unsubscribe();
    }
  }


  toggleMobileMenu() {
    this.menuOpen = !this.menuOpen;
  }

  closeMobileMenu(){
    this.menuOpen = false;
  }

  getDashboardRoute(): string {
    const role = this.auth.getRole(this.token);

    switch(role){

      case'DOCTOR':
         return'/doctor/dashboard';

      case'PATIENT':
          return'/patient/dashboard';

      default:
          return'/home';
    }
  }

  getUserRoleText(): string {
    const role = this.auth.getRole(this.token);

    switch(role){

      case'DOCTOR':
          return'doctor';

      case'PATIENT':
          return'patient';

      default:
          return'user';
    }
  }

  logout(): void {
    if(confirm("Are you sure you want to logout?")){
      this.auth.logout();
      this.closeMobileMenu();
      this.router.navigate(['/home']);
    }
}

isRouterActive(route: string): boolean {
  return this.router.url.startsWith(route);
}

}